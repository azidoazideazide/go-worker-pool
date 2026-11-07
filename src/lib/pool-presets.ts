/**
 * Data model and presets for the worker pool picture.
 *
 * The picture models one Go program:
 *
 *   jobs    := make(chan Job, capacity)   // Channel + Buffer
 *   results := make(chan Result)          // Results
 *   for id := 1; id <= workers; id++ {
 *       go worker(id, jobs, results)       // Workers (goroutines)
 *   }
 *   jobs <- job                            // Producer
 *
 * Presets are SEEDS, not snapshots. `createPool()` in `pool-engine.ts` places the
 * seed and then runs `settle()`, so a preset can never show an idle worker next to
 * a non-empty buffer (Go would hand that job over at once).
 */

export type Mode = 'core' | 'resilience';

export type JobType = 'email' | 'webhook' | 'image' | 'sync';

/**
 * The scripted result of one attempt in Resilience mode.
 * - `ok`    — the attempt finishes after `workSec`.
 * - `stall` — a latency spike: the attempt never replies; only the ctx deadline ends it.
 * - `error` — a transient error (for example HTTP 503) part way through the attempt.
 * Core mode ignores plans: every attempt is `ok`.
 */
export type AttemptPlan = 'ok' | 'stall' | 'error';

export type PresetKey = 'steady' | 'backpressure' | 'timeouts' | 'drain';

export interface JobTypeInfo {
	/** Short label on the job packet. */
	tag: string;
	/** Plain words for screen readers and the event log. */
	label: string;
	/** Inclusive range of work seconds for random jobs of this type. */
	workSec: [min: number, max: number];
	/** Transient error text used in Resilience mode. */
	errorText: string;
}

export const JOB_TYPES: Record<JobType, JobTypeInfo> = {
	email: { tag: 'EMAIL', label: 'send email', workSec: [1, 2], errorText: 'SMTP 421' },
	webhook: { tag: 'WEBHOOK', label: 'deliver webhook', workSec: [1, 3], errorText: 'HTTP 503' },
	image: { tag: 'IMG', label: 'resize image', workSec: [3, 5], errorText: 'decoder busy' },
	sync: { tag: 'SYNC', label: 'sync records', workSec: [2, 4], errorText: 'DB conn reset' },
};

export const JOB_TYPE_ORDER: JobType[] = ['email', 'webhook', 'image', 'sync'];

/** Fixed sizes of the picture. Sliders stay inside these limits. */
export const MAX_WORKERS = 6;
export const MAX_BUFFER = 6;
/** One first attempt plus two retries. */
export const MAX_ATTEMPTS = 3;
export const MAX_RETRIES = MAX_ATTEMPTS - 1;

export interface JobSeed {
	/** Omit to take the next sequential ID from the pool. */
	id?: number;
	type: JobType;
	workSec: number;
	/** Per-attempt plan for Resilience mode. Missing entries are rolled from `spikeChance`. */
	plan?: AttemptPlan[];
}

export interface BusySeed {
	job: JobSeed;
	/** Seconds already spent on the first attempt when the preset loads. */
	elapsedSec: number;
}

export interface PoolPreset {
	key: PresetKey;
	order: number;
	label: string;
	mode: Mode;
	/** One sentence shown above the picture: what the visitor should watch for. */
	hint: string;
	workers: number;
	capacity: number;
	timeoutSec: number;
	/** Chance (0–0.5) that a random attempt has a latency spike or transient error. */
	spikeChance: number;
	autoSend: boolean;
	/** Seconds between producer sends while Auto-send is on. */
	sendEverySec: number;
	/** Seconds until the first automatic send after the preset loads. */
	firstSendInSec: number;
	/** First job ID the producer uses for new jobs. */
	nextId: number;
	/** Seed for the deterministic random generator, so Reset replays the same run. */
	seed: number;
	/** Jobs already running, placed on Worker 1, Worker 2, ... in order. */
	busy: BusySeed[];
	/** Jobs waiting in the buffer. Index 0 is Buffer [0], the front of the channel. */
	buffer: JobSeed[];
	/** A job the producer holds while it is blocked on `jobs <- job`. Only valid with a full buffer. */
	blocked?: JobSeed;
	/** Jobs the producer sends next, in order. After the script ends, jobs are random. */
	script: JobSeed[];
}

export const POOL_PRESETS: Record<PresetKey, PoolPreset> = {
	steady: {
		key: 'steady',
		order: 1,
		label: 'Steady flow',
		mode: 'core',
		hint: 'Workers keep up with the producer. A parked worker takes each new job at once, so the buffer stays almost empty.',
		workers: 3,
		capacity: 6,
		timeoutSec: 4,
		spikeChance: 0.2,
		autoSend: true,
		sendEverySec: 1.1,
		firstSendInSec: 0.5,
		nextId: 103,
		seed: 1103,
		busy: [
			{ job: { id: 101, type: 'email', workSec: 2 }, elapsedSec: 0.9 },
			{ job: { id: 102, type: 'image', workSec: 4 }, elapsedSec: 1.4 },
		],
		buffer: [],
		script: [
			{ type: 'sync', workSec: 3 },
			{ type: 'email', workSec: 1 },
			{ type: 'webhook', workSec: 2 },
			{ type: 'image', workSec: 4 },
			{ type: 'email', workSec: 2 },
			{ type: 'sync', workSec: 2 },
		],
	},
	backpressure: {
		key: 'backpressure',
		order: 2,
		label: 'Backpressure',
		mode: 'core',
		hint: 'Jobs arrive faster than two workers can finish them. The buffer fills, then the producer blocks on jobs\u00a0<-\u00a0job.',
		workers: 2,
		capacity: 4,
		timeoutSec: 4,
		spikeChance: 0.2,
		autoSend: true,
		sendEverySec: 0.7,
		firstSendInSec: 0.7,
		nextId: 208,
		seed: 2208,
		busy: [
			{ job: { id: 201, type: 'image', workSec: 4 }, elapsedSec: 1.0 },
			{ job: { id: 202, type: 'sync', workSec: 3 }, elapsedSec: 2.2 },
		],
		buffer: [
			{ id: 203, type: 'email', workSec: 2 },
			{ id: 204, type: 'webhook', workSec: 2 },
			{ id: 205, type: 'image', workSec: 3 },
			{ id: 206, type: 'sync', workSec: 2 },
		],
		blocked: { id: 207, type: 'email', workSec: 1 },
		script: [],
	},
	timeouts: {
		key: 'timeouts',
		order: 3,
		label: 'Timeout & retry',
		mode: 'resilience',
		hint: 'Each attempt runs under context.WithTimeout. A late attempt is cancelled at the deadline and retried after a backoff. After 3 attempts the job goes to Failed.',
		workers: 3,
		capacity: 6,
		timeoutSec: 4,
		spikeChance: 0.2,
		autoSend: true,
		sendEverySec: 1.8,
		firstSendInSec: 1.2,
		nextId: 305,
		seed: 3305,
		busy: [
			// Latency spike on attempt 1, then a normal 2s attempt: retry fixes it.
			{ job: { id: 301, type: 'webhook', workSec: 2, plan: ['stall', 'ok'] }, elapsedSec: 1.2 },
			{ job: { id: 302, type: 'email', workSec: 1, plan: ['ok'] }, elapsedSec: 0.2 },
			// Needs 5s but the deadline is 4s: every attempt times out, so it ends in Failed.
			{ job: { id: 303, type: 'image', workSec: 5, plan: ['ok', 'ok', 'ok'] }, elapsedSec: 0.4 },
		],
		// Transient error on attempt 1, then success.
		buffer: [{ id: 304, type: 'sync', workSec: 2, plan: ['error', 'ok'] }],
		script: [
			{ type: 'email', workSec: 1, plan: ['ok'] },
			{ type: 'webhook', workSec: 2, plan: ['stall', 'stall', 'ok'] },
			{ type: 'sync', workSec: 2, plan: ['ok'] },
			{ type: 'email', workSec: 2, plan: ['error', 'ok'] },
		],
	},
	drain: {
		key: 'drain',
		order: 4,
		label: 'Drain & idle',
		mode: 'core',
		hint: 'The producer has stopped. Workers drain the buffer, then park on\u00a0<-jobs and use no CPU while they wait.',
		workers: 3,
		capacity: 6,
		timeoutSec: 4,
		spikeChance: 0.2,
		autoSend: false,
		sendEverySec: 1.1,
		firstSendInSec: 1.1,
		nextId: 407,
		seed: 4407,
		busy: [
			{ job: { id: 401, type: 'sync', workSec: 3 }, elapsedSec: 0.6 },
			{ job: { id: 402, type: 'email', workSec: 2 }, elapsedSec: 1.1 },
			{ job: { id: 403, type: 'image', workSec: 4 }, elapsedSec: 0.3 },
		],
		buffer: [
			{ id: 404, type: 'webhook', workSec: 2 },
			{ id: 405, type: 'email', workSec: 1 },
			{ id: 406, type: 'sync', workSec: 2 },
		],
		script: [],
	},
};

export const PRESET_ORDER: PresetKey[] = ['steady', 'backpressure', 'timeouts', 'drain'];

export const DEFAULT_PRESET: PresetKey = 'steady';

export const MODE_HINTS: Record<Mode, string> = {
	core: 'Core mode: every job finishes. Watch jobs move from the channel to the workers and on to Results.',
	resilience:
		'Resilience mode: each attempt gets a deadline from context.WithTimeout. Failed attempts retry with backoff; after 3 attempts the job goes to Failed.',
};
