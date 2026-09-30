import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_SOUND, type SoundId } from '@/constants/sounds';
import { TIMER_COLORS } from '@/constants/timer-colors';
import { persistStorage } from '@/store/storage';

type SettingsState = {
  color: string;
  sound: SoundId;
  haptics: boolean;
  keepAwake: boolean;
  setColor: (color: string) => void;
  setSound: (sound: SoundId) => void;
  toggle: (key: 'haptics' | 'keepAwake') => void;
};

/** v0 stored `sound` as an on/off chime toggle; v1 stores which sound to play. */
export function migrateSettings(persisted: unknown, version: number) {
  const state = { ...(persisted as Record<string, unknown>) };
  if (version < 1 && typeof state.sound === 'boolean') {
    state.sound = state.sound ? DEFAULT_SOUND : 'silent';
  }
  return state;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      color: TIMER_COLORS[0].value,
      sound: DEFAULT_SOUND,
      haptics: true,
      keepAwake: true,
      setColor: (color) => set({ color }),
      setSound: (sound) => set({ sound }),
      toggle: (key) => set((s) => ({ [key]: !s[key] })),
    }),
    {
      name: 'settings',
      storage: persistStorage,
      version: 1,
      migrate: (persisted, version) => migrateSettings(persisted, version) as unknown as SettingsState,
    },
  ),
);
