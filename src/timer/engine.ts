/**
 * Pure countdown state machine. Time is always derived from an absolute end
 * timestamp, so the timer stays exact across backgrounding, throttled tabs,
 * and app restarts. Every function takes `now` explicitly to stay testable.
 */

export type TimerState =
  | { status: 'idle'; durationMs: number }
  | { status: 'running'; durationMs: number; startedAt: number; endAt: number }
  | { status: 'paused'; durationMs: number; startedAt: number; remainingMs: number }
  | { status: 'finished'; durationMs: number; startedAt: number; endedAt: number };

export type TimerStatus = TimerState['status'];

export function createTimer(durationMs: number): TimerState {
  if (!(durationMs > 0)) throw new Error(`Timer duration must be positive, got ${durationMs}`);
  return { status: 'idle', durationMs };
}

export function start(state: TimerState, now: number): TimerState {
  if (state.status !== 'idle' && state.status !== 'finished') return state;
  return {
    status: 'running',
    durationMs: state.durationMs,
    startedAt: now,
    endAt: now + state.durationMs,
  };
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== 'running') return state;
  return {
    status: 'paused',
    durationMs: state.durationMs,
    startedAt: state.startedAt,
    remainingMs: Math.max(0, state.endAt - now),
  };
}

export function resume(state: TimerState, now: number): TimerState {
  if (state.status !== 'paused') return state;
  return {
    status: 'running',
    durationMs: state.durationMs,
    startedAt: state.startedAt,
    endAt: now + state.remainingMs,
  };
}

export function reset(state: TimerState): TimerState {
  return createTimer(state.durationMs);
}

export function setDuration(_state: TimerState, durationMs: number): TimerState {
  return createTimer(durationMs);
}

/** Moves a running timer to `finished` once its end time has passed. */
export function tick(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || now < state.endAt) return state;
  return {
    status: 'finished',
    durationMs: state.durationMs,
    startedAt: state.startedAt,
    endedAt: state.endAt,
  };
}

export function remainingMs(state: TimerState, now: number): number {
  switch (state.status) {
    case 'idle':
      return state.durationMs;
    case 'running':
      return Math.max(0, state.endAt - now);
    case 'paused':
      return state.remainingMs;
    case 'finished':
      return 0;
  }
}

/** Fraction of the timer still remaining, from 1 (full) to 0 (done). */
export function progress(state: TimerState, now: number): number {
  return remainingMs(state, now) / state.durationMs;
}

export type DurationParts = { hours: number; minutes: number; seconds: number };

export function splitDuration(ms: number): DurationParts {
  const total = Math.ceil(ms / 1000);
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function joinDuration({ hours, minutes, seconds }: DurationParts): number {
  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
}

/** `m:ss` under an hour, `h:mm:ss` otherwise. Partial seconds round up. */
export function formatDuration(ms: number): string {
  const { hours, minutes, seconds } = splitDuration(Math.max(0, ms));
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${ss}`;
  return `${minutes}:${ss}`;
}

/** Short label for chips and history rows, e.g. `90s`, `5m`, `1h 30m`. */
export function formatShort(ms: number): string {
  const { hours, minutes, seconds } = splitDuration(ms);
  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds) parts.push(`${seconds}s`);
  return parts.join(' ') || '0s';
}
