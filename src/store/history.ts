import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { newId, persistStorage } from '@/store/storage';

export type HistoryEntry = {
  id: string;
  durationMs: number;
  /** Time actually counted down, excluding pauses. Equals durationMs when completed. */
  ranMs: number;
  startedAt: number;
  endedAt: number;
  outcome: 'completed' | 'cancelled';
};

export const HISTORY_LIMIT = 50;

type HistoryState = {
  entries: HistoryEntry[];
  record: (entry: Omit<HistoryEntry, 'id'>) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      record: (entry) =>
        set((s) => ({
          entries: [{ id: newId(), ...entry }, ...s.entries].slice(0, HISTORY_LIMIT),
        })),
      remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      clear: () => set({ entries: [] }),
    }),
    { name: 'history', storage: persistStorage },
  ),
);

/** Distinct durations, most recent first. */
export function recentTimes(entries: HistoryEntry[], limit = 20): number[] {
  const seen = new Set<number>();
  for (const e of entries) {
    if (seen.size >= limit) break;
    seen.add(e.durationMs);
  }
  return [...seen];
}
