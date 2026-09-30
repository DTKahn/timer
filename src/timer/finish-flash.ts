import type { TimerState } from '@/timer/engine';

const FLASHES = 3;
const ON_MS = 400;
const OFF_MS = 300;
export const FINISH_SEQUENCE_MS = FLASHES * (ON_MS + OFF_MS);

/**
 * The completion sequence: the whole disk flashes three times right after a
 * timer finishes. Derived from time since the end, so it can't get stuck and
 * doesn't replay when the app is reopened later.
 */
export function finishFlash(timer: TimerState, now: number): { active: boolean; lit: boolean } {
  if (timer.status !== 'finished') return { active: false, lit: false };
  // The last frame before finishing can read slightly before the end time.
  const elapsed = Math.max(0, now - timer.endedAt);
  if (elapsed >= FINISH_SEQUENCE_MS) return { active: false, lit: false };
  return { active: true, lit: elapsed % (ON_MS + OFF_MS) < ON_MS };
}
