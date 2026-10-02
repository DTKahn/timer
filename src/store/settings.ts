import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_SOUND, isSoundId, type SoundId } from '@/constants/sounds';
import { TIMER_COLORS } from '@/constants/timer-colors';
import { persistStorage } from '@/store/storage';

type SettingsState = {
  /** The single timer color, or the first ring in multi-color mode. Used as the app's accent. */
  color: string;
  /** When on, the dial shows every color in `colors` as concentric rings. */
  multiColor: boolean;
  /** Multi-color selection in the order picked, outermost ring first. */
  colors: string[];
  sound: SoundId;
  haptics: boolean;
  keepAwake: boolean;
  setColor: (color: string) => void;
  /** Adds or removes a color from the multi-color selection; the last one can't be removed. */
  toggleColor: (color: string) => void;
  setMultiColor: (on: boolean) => void;
  setSound: (sound: SoundId) => void;
  toggle: (key: 'haptics' | 'keepAwake') => void;
};

/**
 * v0 stored `sound` as an on/off toggle; v1 stored a sound id; v2 retired
 * chime, marimba, beeps, and soft. Anything unknown falls back to the default.
 */
export function migrateSettings(persisted: unknown, version: number) {
  const state = { ...(persisted as Record<string, unknown>) };
  if (version < 1 && typeof state.sound === 'boolean') {
    state.sound = state.sound ? DEFAULT_SOUND : 'silent';
  }
  if ('sound' in state && !isSoundId(state.sound)) state.sound = DEFAULT_SOUND;
  return state;
}

export function toggledColors(colors: string[], color: string): { colors: string[]; color: string } {
  const key = color.toLowerCase();
  const has = colors.some((c) => c.toLowerCase() === key);
  if (has && colors.length === 1) return { colors, color: colors[0] };
  const next = has ? colors.filter((c) => c.toLowerCase() !== key) : [...colors, color];
  return { colors: next, color: next[0] };
}

/** Colors the dial draws, outermost first. */
export function dialColors(s: Pick<SettingsState, 'color' | 'multiColor' | 'colors'>): string[] {
  return s.multiColor && s.colors.length > 0 ? s.colors : [s.color];
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      color: TIMER_COLORS[0].value,
      multiColor: false,
      colors: [TIMER_COLORS[0].value],
      sound: DEFAULT_SOUND,
      haptics: true,
      keepAwake: true,
      setColor: (color) => set({ color }),
      toggleColor: (color) => set((s) => toggledColors(s.colors, color)),
      // Multi-color mode starts from the current color; leaving it keeps the first ring.
      setMultiColor: (on) => set((s) => (on ? { multiColor: true, colors: [s.color] } : { multiColor: false })),
      setSound: (sound) => set({ sound }),
      toggle: (key) => set((s) => ({ [key]: !s[key] })),
    }),
    {
      name: 'settings',
      storage: persistStorage,
      version: 2,
      migrate: (persisted, version) => migrateSettings(persisted, version) as unknown as SettingsState,
    },
  ),
);
