/** Completion sounds, in picker order. Files live at assets/sounds/<id>.wav. */
export const SOUNDS = [
  { id: 'bell', name: 'Bell' },
  { id: 'bird', name: 'Bird' },
  { id: 'guitar', name: 'Guitar' },
  { id: 'silent', name: 'Silent' },
] as const;

export type SoundId = (typeof SOUNDS)[number]['id'];

export const DEFAULT_SOUND: SoundId = 'bell';

export function isSoundId(value: unknown): value is SoundId {
  return SOUNDS.some((s) => s.id === value);
}
