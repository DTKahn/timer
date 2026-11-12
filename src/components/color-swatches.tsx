import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { contentColorOn, TIMER_COLORS } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';

export const SWATCH_SIZE = 60;
export const SWATCH_GAP = Spacing.three;

export const MODE_SWITCH_HEIGHT = 36 + 2 * Spacing.half;

type ColorSwatchesProps = {
  /** Selected colors; in multi mode, in ring order. */
  value: string[];
  multi?: boolean;
  onPress: (color: string) => void;
  /** Fixed grid, from useSwatchLayout; otherwise circles wrap to the container. */
  layout?: SwatchLayout;
};

type SwatchLayout = { columns: number; size: number };

/** The preset colors, plus custom (hex) picks so they can be seen and deselected. */
export function swatchOptions(value: string[]) {
  const custom = value
    .filter((v) => !TIMER_COLORS.some((c) => c.value.toLowerCase() === v.toLowerCase()))
    .map((v) => ({ name: `Custom ${v}`, value: v }));
  return [...TIMER_COLORS, ...custom];
}

export function gridWidth({ columns, size }: SwatchLayout) {
  return columns * size + (columns - 1) * SWATCH_GAP;
}

/**
 * Circle diameter for picker options. On narrow screens (like iPhone mini) it shrinks so four
 * still fit per row: the room left after the picker overlay's and panel's Spacing.four padding
 * on each side.
 */
export function useSwatchSize() {
  const { width } = useWindowDimensions();
  return Math.min(SWATCH_SIZE, Math.floor((width - 4 * Spacing.four - 3 * SWATCH_GAP) / 4));
}

const MIN_COLUMNS = 4;

/**
 * Columns and circle size for `count` options in the picker overlay, given the height the rest of
 * the panel takes. Upright that's four per row; on a short screen (like a phone on its side) it
 * spreads them over more columns so every row fits, picking whichever keeps the circles biggest.
 */
export function useSwatchLayout(count: number, reservedHeight: number): SwatchLayout {
  const { width, height } = useWindowDimensions();
  // The overlay's and panel's Spacing.four padding on each side.
  const maxWidth = width - 4 * Spacing.four;
  const maxHeight = height - 4 * Spacing.four - reservedHeight;
  let best: SwatchLayout = { columns: MIN_COLUMNS, size: 0 };
  for (let columns = MIN_COLUMNS; columns <= Math.max(MIN_COLUMNS, count); columns++) {
    const rows = Math.ceil(count / columns);
    const size = Math.floor(
      Math.min(
        SWATCH_SIZE,
        (maxWidth - (columns - 1) * SWATCH_GAP) / columns,
        (maxHeight - (rows - 1) * SWATCH_GAP) / rows,
      ),
    );
    if (size > best.size) best = { columns, size };
  }
  // Too small to fit at all: keep circles tappable rather than vanishing.
  return { columns: best.columns, size: Math.max(best.size, MIN_SWATCH_SIZE) };
}

const MIN_SWATCH_SIZE = 28;

export function ColorSwatches({ value, multi = false, onPress, layout }: ColorSwatchesProps) {
  const theme = useTheme();
  const fallbackSize = useSwatchSize();
  const size = layout?.size ?? fallbackSize;
  const selected = value.map((v) => v.toLowerCase());

  return (
    <View
      style={[styles.grid, layout && { width: gridWidth(layout) }]}
      accessibilityRole={multi ? undefined : 'radiogroup'}>
      {swatchOptions(value).map((c) => {
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
    height: MODE_SWITCH_HEIGHT - 2 * Spacing.half,
    paddingHorizontal: Spacing.three,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
