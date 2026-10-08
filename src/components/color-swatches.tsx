import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { contentColorOn, TIMER_COLORS } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';

export const SWATCH_SIZE = 60;
export const SWATCH_GAP = Spacing.three;

type ColorSwatchesProps = {
  /** Selected colors; in multi mode, in ring order. */
  value: string[];
  multi?: boolean;
  onPress: (color: string) => void;
};

/**
 * Circle diameter for picker options. On narrow screens (like iPhone mini) it shrinks so four
 * still fit per row: the room left after the picker overlay's and panel's Spacing.four padding
 * on each side.
 */
export function useSwatchSize() {
  const { width } = useWindowDimensions();
  return Math.min(SWATCH_SIZE, Math.floor((width - 4 * Spacing.four - 3 * SWATCH_GAP) / 4));
}

export function ColorSwatches({ value, multi = false, onPress }: ColorSwatchesProps) {
  const theme = useTheme();
  const size = useSwatchSize();
  const selected = value.map((v) => v.toLowerCase());
  // Custom (hex) picks get a swatch too, so they can be seen and deselected.
  const custom = value
    .filter((v) => !TIMER_COLORS.some((c) => c.value.toLowerCase() === v.toLowerCase()))
    .map((v) => ({ name: `Custom ${v}`, value: v }));

  return (
    <View style={styles.grid} accessibilityRole={multi ? undefined : 'radiogroup'}>
      {[...TIMER_COLORS, ...custom].map((c) => {
        const index = selected.indexOf(c.value.toLowerCase());
        const isSelected = index !== -1;
        const content = contentColorOn(c.value);
        return (
          <Pressable
            key={c.value}
            onPress={() => onPress(c.value)}
            accessibilityRole={multi ? 'checkbox' : 'radio'}
            aria-checked={isSelected}
            accessibilityLabel={multi && isSelected ? `${c.name}, ring ${index + 1}` : c.name}
            style={({ pressed }) => [
              styles.swatch,
              { width: size, height: size, borderRadius: size / 2 },
              { backgroundColor: c.value, borderColor: isSelected ? theme.text : 'transparent' },
              pressed && styles.pressed,
            ]}>
            {isSelected &&
              (multi && value.length > 1 ? (
                <ThemedText type="smallBold" style={{ color: content }}>
                  {index + 1}
                </ThemedText>
              ) : (
                <Check size={26} strokeWidth={3} color={content} />
              ))}
          </Pressable>
        );
      })}
    </View>
  );
}

type ColorModeSwitchProps = {
  multi: boolean;
  accent: string;
  onChange: (multi: boolean) => void;
};

/** Segmented control between picking one color and picking several rings. */
export function ColorModeSwitch({ multi, accent, onChange }: ColorModeSwitchProps) {
  const theme = useTheme();
  const options = [
    { label: 'Single', value: false },
    { label: 'Multiple', value: true },
  ];
  return (
    <View style={[styles.segments, { backgroundColor: theme.backgroundElement }]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.value === multi;
        return (
          <Pressable
            key={o.label}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            aria-checked={active}
            accessibilityLabel={o.value ? 'Multiple colors as rings' : 'Single color'}
            style={({ pressed }) => [
              styles.segment,
              active && { backgroundColor: accent },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" style={active && { color: contentColorOn(accent) }}>
              {o.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SWATCH_GAP },
  swatch: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  segments: { flexDirection: 'row', alignSelf: 'flex-start', borderRadius: 20, padding: Spacing.half },
  segment: {
    height: 36,
    paddingHorizontal: Spacing.three,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
