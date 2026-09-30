/** Completion sounds, in picker order. Files live at assets/sounds/<id>.wav. */
export const SOUNDS = [
  { id: 'chime', name: 'Chime' },
  { id: 'bell', name: 'Bell' },
  { id: 'marimba', name: 'Marimba' },
  { id: 'beeps', name: 'Beeps' },
  { id: 'soft', name: 'Soft' },
  { id: 'silent', name: 'Silent' },
] as const;

export type SoundId = (typeof SOUNDS)[number]['id'];

export const DEFAULT_SOUND: SoundId = 'chime';
