export type JobTone = 'cyan' | 'coral' | 'amber';

export interface WaitingJob {
	id: string;
	slot: number;
	durationSec: number;
	tone: JobTone;
	retryCount?: number;
}

export interface WorkerSlot {
	id: number;
	status: 'BUSY' | 'IDLE' | 'TIMEOUT';
	jobId: string | null;
	durationSec: number;
	remainingSec: number;
	progressPct: number;
	tone: JobTone;
	retryCount?: number;
}

export interface PoolState {
	key: 'normal' | 'full' | 'idle';
	label: string;
	bufferCapacity: number;
	workerCount: number;
	jobTimeSec: number;
	completedJobs: number;
	timedOutJobs: number;
	waitingJobs: WaitingJob[];
	workers: WorkerSlot[];
}

export const POOL_PRESETS: Record<PoolState['key'], PoolState> = {
	normal: {
		key: 'normal',
		label: 'Normal run',
		bufferCapacity: 6,
		workerCount: 3,
		jobTimeSec: 6,
		completedJobs: 12,
		timedOutJobs: 0,
		waitingJobs: [
			{ id: 'Job 104', slot: 0, durationSec: 4, tone: 'cyan', retryCount: 0 },
			{ id: 'Job 105', slot: 1, durationSec: 8, tone: 'coral', retryCount: 0 },
			{ id: 'Job 106', slot: 2, durationSec: 3, tone: 'amber', retryCount: 0 },
			{ id: 'Job 107', slot: 3, durationSec: 5, tone: 'cyan', retryCount: 0 },
		],
		workers: [
			{ id: 1, status: 'BUSY', jobId: 'Job 101', durationSec: 4, remainingSec: 2.0, progressPct: 50, tone: 'cyan', retryCount: 0 },
			{ id: 2, status: 'BUSY', jobId: 'Job 102', durationSec: 5, remainingSec: 3.5, progressPct: 30, tone: 'coral', retryCount: 0 },
			{ id: 3, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
			{ id: 4, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
			{ id: 5, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
			{ id: 6, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
		],
	},
	full: {
		key: 'full',
		label: 'Full buffer',
		bufferCapacity: 6,
		workerCount: 3,
		jobTimeSec: 6,
		completedJobs: 18,
		timedOutJobs: 1,
		waitingJobs: [
			{ id: 'Job 204', slot: 0, durationSec: 4, tone: 'cyan', retryCount: 0 },
			{ id: 'Job 205', slot: 1, durationSec: 9, tone: 'coral', retryCount: 0 },
			{ id: 'Job 206', slot: 2, durationSec: 3, tone: 'amber', retryCount: 0 },
			{ id: 'Job 207', slot: 3, durationSec: 7, tone: 'cyan', retryCount: 0 },
			{ id: 'Job 208', slot: 4, durationSec: 2, tone: 'coral', retryCount: 0 },
			{ id: 'Job 209', slot: 5, durationSec: 5, tone: 'amber', retryCount: 0 },
		],
		workers: [
			{ id: 1, status: 'BUSY', jobId: 'Job 201', durationSec: 5, remainingSec: 1.0, progressPct: 80, tone: 'cyan', retryCount: 0 },
			{ id: 2, status: 'BUSY', jobId: 'Job 202', durationSec: 8, remainingSec: 4.4, progressPct: 45, tone: 'coral', retryCount: 0 },
			{ id: 3, status: 'BUSY', jobId: 'Job 203', durationSec: 4, remainingSec: 3.0, progressPct: 25, tone: 'amber', retryCount: 0 },
			{ id: 4, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
			{ id: 5, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
			{ id: 6, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
		],
	},
	idle: {
		key: 'idle',
		label: 'All workers idle',
		bufferCapacity: 6,
		workerCount: 3,
		jobTimeSec: 6,
		completedJobs: 24,
		timedOutJobs: 0,
		waitingJobs: [],
		workers: [
			{ id: 1, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
			{ id: 2, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
			{ id: 3, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
			{ id: 4, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
			{ id: 5, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
			{ id: 6, status: 'IDLE', jobId: null, durationSec: 0, remainingSec: 0, progressPct: 0, tone: 'cyan', retryCount: 0 },
		],
	},
};
