import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { contentColorOn } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { formatShort } from '@/timer/engine';

export const CHIP_HEIGHT = 40;

type DurationChipsProps = {
  durations: number[];
  selected?: number;
  color: string;
  onSelect: (durationMs: number) => void;
  /** Shown before the chips, scrolling with them. */
  leading?: React.ReactNode;
};

/** Horizontally scrolling row of duration pills (favorites, recents). */
export function DurationChips({ durations, selected, color, onSelect, leading }: DurationChipsProps) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {leading}
      {durations.map((ms) => {
        const active = ms === selected;
        return (
          <Pressable
            key={ms}
            onPress={() => onSelect(ms)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Set timer to ${formatShort(ms)}`}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: active ? color : theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" style={active && { color: contentColorOn(color) }}>
              {formatShort(ms)}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  // Centered when they fit; scrolls from the left edge when they don't.
  row: { flexGrow: 1, justifyContent: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four },
  chip: {
    minWidth: 56,
    height: CHIP_HEIGHT,
    paddingHorizontal: Spacing.three,
    borderRadius: CHIP_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
