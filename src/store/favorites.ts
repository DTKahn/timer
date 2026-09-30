import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { newId, persistStorage } from '@/store/storage';

export type Favorite = { id: string; durationMs: number };

const MIN = 60_000;
export const DEFAULT_FAVORITE_DURATIONS = [1, 2, 5, 10, 30].map((m) => m * MIN);

type FavoritesState = {
  favorites: Favorite[];
  add: (durationMs: number) => void;
  remove: (id: string) => void;
  restoreDefaults: () => void;
};

const byDuration = (a: Favorite, b: Favorite) => a.durationMs - b.durationMs;

/** v0 allowed manual reordering; v1 always keeps favorites sorted by time. */
export function migrateFavorites(persisted: unknown, version: number) {
  const state = { ...(persisted as { favorites?: Favorite[] }) };
  if (version < 1 && Array.isArray(state.favorites)) state.favorites = [...state.favorites].sort(byDuration);
  return state;
}

const defaults = (): Favorite[] =>
  DEFAULT_FAVORITE_DURATIONS.map((durationMs) => ({ id: newId(), durationMs }));

export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: defaults(),
      add: (durationMs) =>
        set((s) =>
          s.favorites.some((f) => f.durationMs === durationMs)
            ? s
            : {
                favorites: [...s.favorites, { id: newId(), durationMs }].sort(byDuration),
              },
        ),
      remove: (id) => set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
      restoreDefaults: () => set({ favorites: defaults() }),
    }),
    {
      name: 'favorites',
      storage: persistStorage,
      version: 1,
      migrate: (persisted, version) => migrateFavorites(persisted, version) as unknown as FavoritesState,
    },
  ),
);
