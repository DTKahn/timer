import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { contentColorOn } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { formatShort } from '@/timer/engine';

type DurationChipsProps = {
  durations: number[];
  selected?: number;
  color: string;
  onSelect: (durationMs: number) => void;
};

/** Horizontally scrolling row of duration pills (favorites, recents). */
export function DurationChips({ durations, selected, color, onSelect }: DurationChipsProps) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
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
  // Left-aligned under the section heading.
  row: { gap: Spacing.two, paddingHorizontal: Spacing.four },
  chip: {
    minWidth: 56,
    height: 40,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
