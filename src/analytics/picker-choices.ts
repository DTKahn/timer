import { SOUNDS, type SoundId } from '@/constants/sounds';
import { TIMER_COLORS } from '@/constants/timer-colors';
import { dialColors } from '@/store/settings';

/** A preset color's name, or `Custom #AABBCC` for one typed in Settings. */
function colorName(value: string): string {
  const preset = TIMER_COLORS.find((c) => c.value.toLowerCase() === value.toLowerCase());
  return preset ? preset.name : `Custom ${value.toUpperCase()}`;
}

/** What the color picker had selected as it closed, for analytics. */
export function colorChoice(settings: { color: string; multiColor: boolean; colors: string[] }) {
  const colors = dialColors(settings).map(colorName);
  return { color: colors[0], colors, multiple: settings.multiColor };
}

/** What the sound picker had selected as it closed, for analytics. */
export function soundChoice(sound: SoundId) {
  return { sound: SOUNDS.find((s) => s.id === sound)?.name ?? sound };
}
