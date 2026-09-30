import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import * as engine from '@/timer/engine';
import type { TimerState } from '@/timer/engine';
import { useHistory } from '@/store/history';
import { persistStorage } from '@/store/storage';

type TimerStore = {
  timer: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  /** Replaces the timer; cancels (and records) any run in progress. */
  setDuration: (durationMs: number) => void;
  /** Call when the clock may have passed the end time. */
  tick: () => void;
};

const DEFAULT_DURATION = 5 * 60_000;

function recordCancelled(timer: TimerState, now: number) {
  if (timer.status !== 'running' && timer.status !== 'paused') return;
  useHistory.getState().record({
    durationMs: timer.durationMs,
    ranMs: timer.durationMs - engine.remainingMs(timer, now),
    startedAt: timer.startedAt,
    endedAt: now,
    outcome: 'cancelled',
  });
}

export const useTimer = create<TimerStore>()(
  persist(
    (set, get) => ({
      timer: engine.createTimer(DEFAULT_DURATION),
      start: () => set({ timer: engine.start(get().timer, Date.now()) }),
      pause: () => set({ timer: engine.pause(get().timer, Date.now()) }),
      resume: () => set({ timer: engine.resume(get().timer, Date.now()) }),
      reset: () => {
        const { timer } = get();
        recordCancelled(timer, Date.now());
        set({ timer: engine.reset(timer) });
      },
      setDuration: (durationMs) => {
        const { timer } = get();
        recordCancelled(timer, Date.now());
        set({ timer: engine.setDuration(timer, durationMs) });
      },
      tick: () => {
        const before = get().timer;
        const after = engine.tick(before, Date.now());
        if (after === before) return;
        set({ timer: after });
        if (after.status === 'finished') {
          useHistory.getState().record({
            durationMs: after.durationMs,
            ranMs: after.durationMs,
                    startedAt: after.startedAt,
            endedAt: after.endedAt,
            outcome: 'completed',
          });
        }
      },
    }),
    {
      name: 'timer',
      storage: persistStorage,
      partialize: (s) => ({ timer: s.timer }),
    },
  ),
);
