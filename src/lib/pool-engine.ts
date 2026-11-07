/**
 * Pure model of one Go worker pool. No DOM access.
 *
 * Channel rules follow runtime/chan.go:
 * 1. Send with a parked receiver: the value goes straight to that receiver and skips the buffer.
 * 2. Send with free buffer space: the value enters the tail of the buffer.
 * 3. Send with a full buffer: the sender parks in the send queue (FIFO) until a receiver arrives.
 * 4. Receive with a full buffer and a parked sender: the receiver takes the head and the
 *    sender's value enters the tail.
 * Receivers that park on `<-jobs` are also served in FIFO order (the one that waited longest).
 */

import {
	JOB_TYPES,
	JOB_TYPE_ORDER,
	MAX_ATTEMPTS,
	MAX_WORKERS,
	POOL_PRESETS,
	type AttemptPlan,
	type JobSeed,
	type JobType,
	type Mode,
	type PresetKey,
} from './pool-presets';

/** Fixed model step. Large frame times are split so event order stays correct. */
export const SUBSTEP_SEC = 0.05;
/** How long a worker shows a timeout or error while it reports the failed Result. Keep in sync with `--duration-alert`. */
export const ALERT_SEC = 0.7;
/** First retry waits about this long. Each later retry doubles it. */
export const BACKOFF_BASE_SEC = 0.8;
/** Upper bound of the random jitter added to each backoff. */
export const BACKOFF_JITTER_SEC = 0.3;
/** Results kept for the Done and Failed trays. */
export const RESULT_HISTORY = 8;

const EPS = 1e-9;

export interface Job {
	id: number;
	type: JobType;
	workSec: number;
	/** 1-based attempt number. Attempt 1 is the first run; attempts 2 and 3 are retries. */
	attempt: number;
	plan: AttemptPlan[];
}

export type WorkerPhase = 'offline' | 'idle' | 'busy' | 'alert';
export type AlertKind = 'timeout' | 'error';

export interface Worker {
	id: number;
	phase: WorkerPhase;
	/** The worker count was lowered while this worker was busy. It exits after this job. */
	exiting: boolean;
	/** Clock time when the worker parked on `<-jobs`. Earliest parked worker receives first. */
	idleSince: number;
	job: Job | null;
	elapsed: number;
	/** Deadline of the current attempt in seconds (Resilience mode), or null (Core mode). */
	deadline: number | null;
	outcome: AttemptPlan;
	errorAt: number | null;
	alertKind: AlertKind | null;
	alertUntil: number;
}

export type SenderKind = 'producer' | 'retry';

export interface Sender {
	from: SenderKind;
	job: Job;
}

export interface Backoff {
	job: Job;
	readyAt: number;
	totalSec: number;
}

export interface Result {
	job: Job;
	status: 'done' | 'failed';
	reason: AlertKind | null;
	tookSec: number;
}

export interface Counters {
	sent: number;
	done: number;
	retried: number;
	timedOut: number;
	errored: number;
	failed: number;
}

export interface PoolState {
	preset: PresetKey;
	mode: Mode;
	clock: number;
	capacity: number;
	workerCount: number;
	timeoutSec: number;
	spikeChance: number;
	autoSend: boolean;
	sendEverySec: number;
	sendTimer: number;
	nextId: number;
	script: JobSeed[];
	rngState: number;
	buffer: Job[];
	sendq: Sender[];
	backoffs: Backoff[];
	workers: Worker[];
	results: Result[];
	counts: Counters;
	drainedAnnounced: boolean;
}

export type PoolEvent =
	| { kind: 'sent'; job: Job; slot: number; from: SenderKind }
	| { kind: 'handoff'; job: Job; workerId: number; from: SenderKind }
	| { kind: 'received'; job: Job; workerId: number; unblocked: SenderKind | null }
	| { kind: 'blocked'; job: Job; from: SenderKind }
	| { kind: 'done'; job: Job; workerId: number; tookSec: number }
	| { kind: 'timeout'; job: Job; workerId: number; afterSec: number }
	| { kind: 'error'; job: Job; workerId: number; afterSec: number }
	| { kind: 'backoff'; job: Job; delaySec: number }
	| { kind: 'failed'; job: Job; reason: AlertKind }
	| { kind: 'worker-start'; workerId: number }
	| { kind: 'worker-exit'; workerId: number }
	| { kind: 'rejected'; job: Job }
	| { kind: 'drained' };

export interface PoolOverrides {
	mode?: Mode;
	capacity?: number;
	workerCount?: number;
	timeoutSec?: number;
	spikeChance?: number;
	autoSend?: boolean;
}

/* ------------------------------------------------------------------ */
/* Random numbers (seeded, so Reset replays the same run)              */
/* ------------------------------------------------------------------ */

function random(state: PoolState): number {
	// mulberry32
	state.rngState = (state.rngState + 0x6d2b79f5) | 0;
	let t = state.rngState;
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

/* ------------------------------------------------------------------ */
/* Construction                                                        */
/* ------------------------------------------------------------------ */

function makeJob(state: PoolState, seed?: JobSeed): Job {
	const source = seed ?? state.script.shift() ?? randomSeed(state);
	const id = source.id ?? state.nextId;
	state.nextId = Math.max(state.nextId, id + 1);
	return { id, type: source.type, workSec: source.workSec, attempt: 1, plan: source.plan ? [...source.plan] : [] };
}

function randomSeed(state: PoolState): JobSeed {
	const type = JOB_TYPE_ORDER[Math.floor(random(state) * JOB_TYPE_ORDER.length)];
	const [min, max] = JOB_TYPES[type].workSec;
	const workSec = min + Math.floor(random(state) * (max - min + 1));
	return { type, workSec };
}

function makeWorker(id: number, online: boolean): Worker {
	return {
		id,
		phase: online ? 'idle' : 'offline',
		exiting: false,
		// Lower IDs parked first, so the first receive goes to the lowest idle ID.
		idleSince: -1 + id * 0.001,
		job: null,
		elapsed: 0,
		deadline: null,
		outcome: 'ok',
		errorAt: null,
		alertKind: null,
		alertUntil: 0,
	};
}

/** Build a pool from a preset seed, apply overrides, then settle it into a valid Go state. */
export function createPool(key: PresetKey, overrides: PoolOverrides = {}): PoolState {
	const preset = POOL_PRESETS[key];
	const workerCount = clamp(overrides.workerCount ?? preset.workers, 1, MAX_WORKERS);
	const capacity = clamp(overrides.capacity ?? preset.capacity, 0, MAX_WORKERS);

	const state: PoolState = {
		preset: key,
		mode: overrides.mode ?? preset.mode,
		clock: 0,
		capacity,
		workerCount,
		timeoutSec: overrides.timeoutSec ?? preset.timeoutSec,
		spikeChance: overrides.spikeChance ?? preset.spikeChance,
		autoSend: overrides.autoSend ?? preset.autoSend,
		sendEverySec: preset.sendEverySec,
		sendTimer: Math.max(0, preset.sendEverySec - preset.firstSendInSec),
		nextId: preset.nextId,
		script: preset.script.map((s) => ({ ...s, plan: s.plan ? [...s.plan] : undefined })),
		rngState: preset.seed,
		buffer: [],
		sendq: [],
		backoffs: [],
		workers: Array.from({ length: MAX_WORKERS }, (_, i) => makeWorker(i + 1, i < workerCount)),
		results: [],
		counts: { sent: 0, done: 0, retried: 0, timedOut: 0, errored: 0, failed: 0 },
		drainedAnnounced: false,
	};

	const leftovers: JobSeed[] = [];

	preset.busy.forEach((seed, index) => {
		const worker = state.workers[index];
		if (!worker || worker.phase !== 'idle') {
			leftovers.push(seed.job);
			return;
		}
		startAttempt(state, worker, makeJob(state, seed.job));
		worker.elapsed = Math.min(seed.elapsedSec, Math.max(0, seed.job.workSec - 0.2));
	});

	const waiting = [...leftovers, ...preset.buffer];
	if (preset.blocked) waiting.push(preset.blocked);
	for (const seed of waiting) {
		const job = makeJob(state, seed);
		if (state.buffer.length < state.capacity) {
			state.buffer.push(job);
		} else if (!state.sendq.some((s) => s.from === 'producer')) {
			state.sendq.push({ from: 'producer', job });
		} else {
			// The producer is one goroutine: it holds at most one blocked job. Send the rest later.
			state.script.unshift({ id: job.id, type: job.type, workSec: job.workSec, plan: job.plan });
		}
	}

	settle(state, []);
	return state;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export function producerBlocked(state: PoolState): boolean {
	return state.sendq.some((s) => s.from === 'producer');
}

export function busyCount(state: PoolState): number {
	return state.workers.filter((w) => w.phase === 'busy' || w.phase === 'alert').length;
}

export function onlineCount(state: PoolState): number {
	return state.workers.filter((w) => w.phase !== 'offline').length;
}

function nextParkedWorker(state: PoolState): Worker | null {
	let best: Worker | null = null;
	for (const worker of state.workers) {
		if (worker.phase !== 'idle' || worker.exiting) continue;
		if (!best || worker.idleSince < best.idleSince) best = worker;
	}
	return best;
}

/* ------------------------------------------------------------------ */
/* Channel operations                                                  */
/* ------------------------------------------------------------------ */

function startAttempt(state: PoolState, worker: Worker, job: Job) {
	worker.phase = 'busy';
	worker.job = job;
	worker.elapsed = 0;
	worker.alertKind = null;
	if (state.mode === 'resilience') {
		worker.deadline = state.timeoutSec;
		worker.outcome = job.plan[job.attempt - 1] ?? rollOutcome(state);
	} else {
		worker.deadline = null;
		worker.outcome = 'ok';
	}
	worker.errorAt = worker.outcome === 'error' ? roundTo(Math.max(0.4, job.workSec * 0.45), 0.05) : null;
}

function rollOutcome(state: PoolState): AttemptPlan {
	if (random(state) >= state.spikeChance) return 'ok';
	return random(state) < 0.6 ? 'stall' : 'error';
}

/** `jobs <- job` from the producer or from a retry timer. */
function deliver(state: PoolState, sender: Sender, events: PoolEvent[]) {
	const receiver = nextParkedWorker(state);
	if (receiver && state.buffer.length === 0) {
		startAttempt(state, receiver, sender.job);
		events.push({ kind: 'handoff', job: sender.job, workerId: receiver.id, from: sender.from });
		return;
	}
	if (state.buffer.length < state.capacity) {
		state.buffer.push(sender.job);
		events.push({ kind: 'sent', job: sender.job, slot: state.buffer.length - 1, from: sender.from });
		return;
	}
	state.sendq.push(sender);
	events.push({ kind: 'blocked', job: sender.job, from: sender.from });
}

/** Apply every channel rule until nothing changes. Call after any mutation. */
function settle(state: PoolState, events: PoolEvent[]) {
	for (let guard = 0; guard < 64; guard++) {
		let changed = false;

		for (const worker of state.workers) {
			if (worker.phase === 'idle' && worker.exiting) {
				worker.phase = 'offline';
				worker.exiting = false;
				events.push({ kind: 'worker-exit', workerId: worker.id });
				changed = true;
			}
		}

		const receiver = nextParkedWorker(state);
		if (receiver && state.buffer.length > 0) {
			const job = state.buffer.shift()!;
			startAttempt(state, receiver, job);
			let unblocked: SenderKind | null = null;
			if (state.sendq.length > 0 && state.buffer.length < state.capacity) {
				const sender = state.sendq.shift()!;
				state.buffer.push(sender.job);
				unblocked = sender.from;
			}
			events.push({ kind: 'received', job, workerId: receiver.id, unblocked });
			continue;
		}

		if (receiver && state.buffer.length === 0 && state.sendq.length > 0) {
			const sender = state.sendq.shift()!;
			startAttempt(state, receiver, sender.job);
			events.push({ kind: 'handoff', job: sender.job, workerId: receiver.id, from: sender.from });
			continue;
		}

		if (state.sendq.length > 0 && state.buffer.length < state.capacity) {
			const sender = state.sendq.shift()!;
			state.buffer.push(sender.job);
			events.push({ kind: 'sent', job: sender.job, slot: state.buffer.length - 1, from: sender.from });
			continue;
		}

		if (!changed) break;
	}
}

/* ------------------------------------------------------------------ */
/* Worker lifecycle                                                    */
/* ------------------------------------------------------------------ */

function pushResult(state: PoolState, result: Result) {
	state.results.unshift(result);
	if (state.results.length > RESULT_HISTORY) state.results.length = RESULT_HISTORY;
}

function park(state: PoolState, worker: Worker) {
	worker.phase = 'idle';
	worker.job = null;
	worker.elapsed = 0;
	worker.deadline = null;
	worker.errorAt = null;
	worker.alertKind = null;
	worker.idleSince = state.clock;
}

function advanceWorker(state: PoolState, worker: Worker, dt: number, events: PoolEvent[]) {
	if (worker.phase === 'alert') {
		if (state.clock + EPS >= worker.alertUntil) finishAlert(state, worker, events);
		return;
	}
	if (worker.phase !== 'busy' || !worker.job) return;

	worker.elapsed += dt;
	const t = worker.elapsed + EPS;
	const job = worker.job;

	if (worker.errorAt !== null && t >= worker.errorAt && (worker.deadline === null || worker.errorAt < worker.deadline)) {
		failAttempt(state, worker, 'error', events);
		return;
	}
	// Work that ends exactly at the deadline counts as done (in Go, select picks
	// one ready case at random; the picture picks the kinder one so it is predictable).
	if (worker.outcome !== 'stall' && t >= job.workSec) {
		const tookSec = roundTo(worker.elapsed, 0.1);
		pushResult(state, { job, status: 'done', reason: null, tookSec });
		state.counts.done += 1;
		events.push({ kind: 'done', job, workerId: worker.id, tookSec });
		park(state, worker);
		return;
	}
	if (worker.deadline !== null && t >= worker.deadline) {
		failAttempt(state, worker, 'timeout', events);
	}
}

function failAttempt(state: PoolState, worker: Worker, kind: AlertKind, events: PoolEvent[]) {
	const job = worker.job!;
	const afterSec = roundTo(worker.elapsed, 0.1);
	worker.phase = 'alert';
	worker.alertKind = kind;
	worker.alertUntil = state.clock + ALERT_SEC;
	if (kind === 'timeout') {
		state.counts.timedOut += 1;
		events.push({ kind: 'timeout', job, workerId: worker.id, afterSec });
	} else {
		state.counts.errored += 1;
		events.push({ kind: 'error', job, workerId: worker.id, afterSec });
	}
}

function finishAlert(state: PoolState, worker: Worker, events: PoolEvent[]) {
	const job = worker.job!;
	const kind = worker.alertKind ?? 'timeout';
	if (job.attempt < MAX_ATTEMPTS) {
		job.attempt += 1;
		const delaySec = roundTo(BACKOFF_BASE_SEC * 2 ** (job.attempt - 2) + random(state) * BACKOFF_JITTER_SEC, 0.05);
		state.backoffs.push({ job, readyAt: state.clock + delaySec, totalSec: delaySec });
		state.counts.retried += 1;
		events.push({ kind: 'backoff', job, delaySec });
	} else {
		pushResult(state, { job, status: 'failed', reason: kind, tookSec: roundTo(worker.elapsed, 0.1) });
		state.counts.failed += 1;
		events.push({ kind: 'failed', job, reason: kind });
	}
	park(state, worker);
}

/* ------------------------------------------------------------------ */
/* Public commands                                                     */
/* ------------------------------------------------------------------ */

/** Advance the pool by `dtSec` seconds and return what happened, in order. */
export function step(state: PoolState, dtSec: number): PoolEvent[] {
	const events: PoolEvent[] = [];
	let remaining = dtSec;
	while (remaining > EPS) {
		const dt = Math.min(SUBSTEP_SEC, remaining);
		remaining -= dt;
		state.clock += dt;

		for (const worker of state.workers) advanceWorker(state, worker, dt, events);

		for (let i = 0; i < state.backoffs.length; i++) {
			const entry = state.backoffs[i];
			if (entry.readyAt <= state.clock + EPS) {
				state.backoffs.splice(i, 1);
				i -= 1;
				deliver(state, { from: 'retry', job: entry.job }, events);
			}
		}

		if (state.autoSend && !producerBlocked(state)) {
			state.sendTimer += dt;
			if (state.sendTimer + EPS >= state.sendEverySec) {
				state.sendTimer = 0;
				state.counts.sent += 1;
				deliver(state, { from: 'producer', job: makeJob(state) }, events);
			}
		}

		settle(state, events);
	}

	if (isDrained(state)) {
		if (!state.drainedAnnounced && events.length > 0) {
			state.drainedAnnounced = true;
			events.push({ kind: 'drained' });
		}
	} else {
		state.drainedAnnounced = false;
	}
	return events;
}

export function isDrained(state: PoolState): boolean {
	return (
		!state.autoSend &&
		state.buffer.length === 0 &&
		state.sendq.length === 0 &&
		state.backoffs.length === 0 &&
		state.workers.every((w) => w.phase === 'idle' || w.phase === 'offline')
	);
}

/** The visitor presses Send job. One producer goroutine can hold only one blocked send. */
export function sendJob(state: PoolState): PoolEvent[] {
	const events: PoolEvent[] = [];
	const held = state.sendq.find((s) => s.from === 'producer');
	if (held) {
		events.push({ kind: 'rejected', job: held.job });
		return events;
	}
	state.counts.sent += 1;
	state.sendTimer = 0;
	deliver(state, { from: 'producer', job: makeJob(state) }, events);
	settle(state, events);
	state.drainedAnnounced = false;
	return events;
}

/** Start new worker goroutines, or ask extra ones to exit after their current job. */
export function setWorkerCount(state: PoolState, count: number): PoolEvent[] {
	const events: PoolEvent[] = [];
	state.workerCount = clamp(count, 1, MAX_WORKERS);
	state.workers.forEach((worker, index) => {
		if (index < state.workerCount) {
			worker.exiting = false;
			if (worker.phase === 'offline') {
				worker.phase = 'idle';
				worker.idleSince = state.clock;
				events.push({ kind: 'worker-start', workerId: worker.id });
			}
		} else if (worker.phase === 'idle') {
			worker.phase = 'offline';
			events.push({ kind: 'worker-exit', workerId: worker.id });
		} else if (worker.phase === 'busy' || worker.phase === 'alert') {
			worker.exiting = true;
		}
	});
	settle(state, events);
	return events;
}

/** Mode applies to the NEXT attempt. A running attempt keeps the context it started with. */
export function setMode(state: PoolState, mode: Mode) {
	state.mode = mode;
}

/** The deadline is fixed when `context.WithTimeout` runs, so this applies to the next attempt. */
export function setTimeoutSec(state: PoolState, seconds: number) {
	state.timeoutSec = seconds;
}

export function setSpikeChance(state: PoolState, chance: number) {
	state.spikeChance = clamp(chance, 0, 0.5);
}

export function setAutoSend(state: PoolState, on: boolean) {
	state.autoSend = on;
	if (on) state.sendTimer = Math.max(state.sendTimer, state.sendEverySec * 0.6);
	state.drainedAnnounced = false;
}

/* ------------------------------------------------------------------ */
/* Invariants (used in dev builds and tests)                           */
/* ------------------------------------------------------------------ */

export function checkInvariants(state: PoolState): string[] {
	const problems: string[] = [];
	const parked = state.workers.filter((w) => w.phase === 'idle' && !w.exiting);
	if (parked.length > 0 && state.buffer.length > 0) problems.push('An idle worker is parked next to a non-empty buffer.');
	if (parked.length > 0 && state.sendq.length > 0) problems.push('A sender is blocked while a worker is parked.');
	if (state.buffer.length > state.capacity) problems.push('The buffer holds more jobs than its capacity.');
	if (state.sendq.length > 0 && state.buffer.length < state.capacity) problems.push('A sender is blocked while the buffer has space.');
	if (state.sendq.filter((s) => s.from === 'producer').length > 1) problems.push('The producer holds more than one blocked send.');
	if (onlineCount(state) > state.workerCount + state.workers.filter((w) => w.exiting).length) problems.push('Too many workers are online.');

	const seen = new Map<number, string>();
	const mark = (job: Job, where: string) => {
		if (seen.has(job.id)) problems.push(`Job ${job.id} is in ${seen.get(job.id)} and ${where}.`);
		seen.set(job.id, where);
	};
	state.buffer.forEach((j) => mark(j, 'the buffer'));
	state.sendq.forEach((s) => mark(s.job, 'sendq'));
	state.backoffs.forEach((b) => mark(b.job, 'backoff'));
	state.workers.forEach((w) => w.job && mark(w.job, `worker ${w.id}`));
	return problems;
}

/* ------------------------------------------------------------------ */
/* Event text (Go words from GLOSSARY.md)                              */
/* ------------------------------------------------------------------ */

export function describeEvent(event: PoolEvent, state: PoolState): string | null {
	switch (event.kind) {
		case 'sent':
			return event.from === 'retry'
				? `Retry: job ${event.job.id} re-entered Buffer [${event.slot}]`
				: `Producer sent job ${event.job.id} into Buffer [${event.slot}]`;
		case 'handoff':
			return `Worker ${event.workerId} was parked on <-jobs: job ${event.job.id} handed over directly`;
		case 'received':
			return event.unblocked
				? `Worker ${event.workerId} received job ${event.job.id}; the blocked ${event.unblocked === 'producer' ? 'producer' : 'retry'} send completed`
				: `Worker ${event.workerId} received job ${event.job.id} from Buffer [0]`;
		case 'blocked':
			return state.capacity === 0
				? `Unbuffered channel: job ${event.job.id} waits for a receiver`
				: `Buffer full: ${event.from === 'producer' ? 'producer' : 'retry'} blocked on jobs <- job ${event.job.id}`;
		case 'done':
			return `Worker ${event.workerId} sent Result{job ${event.job.id}, done, ${event.tookSec.toFixed(1)}s}`;
		case 'timeout':
			return `Worker ${event.workerId}: context deadline exceeded after ${event.afterSec.toFixed(1)}s (job ${event.job.id}, attempt ${event.job.attempt}/${MAX_ATTEMPTS})`;
		case 'error':
			return `Worker ${event.workerId}: transient error ${JOB_TYPES[event.job.type].errorText} (job ${event.job.id}, attempt ${event.job.attempt}/${MAX_ATTEMPTS})`;
		case 'backoff':
			return `Job ${event.job.id} retries in ${event.delaySec.toFixed(2)}s (backoff)`;
		case 'failed':
			return `Job ${event.job.id} failed after ${MAX_ATTEMPTS} attempts: moved to Failed`;
		case 'worker-start':
			return `go worker(${event.workerId}, jobs, results) started`;
		case 'worker-exit':
			return `Worker ${event.workerId} exited`;
		case 'rejected':
			return `Producer is still blocked on jobs <- job ${event.job.id}. Wait for a free slot.`;
		case 'drained':
			return 'Buffer empty: every worker is parked on <-jobs';
		default:
			return null;
	}
}
