import { useId, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { contentColorOn } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { formatShort } from '@/timer/engine';

export const CHIP_HEIGHT = 40;
const FADE_WIDTH = 32;

type DurationChipsProps = {
  durations: number[];
  selected?: number;
  color: string;
  onSelect: (durationMs: number) => void;
};

/**
 * Horizontally scrolling row of duration pills (favorites, recents). Sized to
 * its chips when they fit; otherwise it scrolls, and each edge fades out while
 * there's more to see that way.
 */
export function DurationChips({ durations, selected, color, onSelect }: DurationChipsProps) {
  const theme = useTheme();
  const [view, setView] = useState({ x: 0, width: 0, content: 0 });
  const more = { left: view.x > 1, right: view.x + view.width < view.content - 1 };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          setView((v) => (v.x === x ? v : { ...v, x }));
        }}
        onLayout={(e) => {
          const width = e.nativeEvent.layout.width;
          setView((v) => (v.width === width ? v : { ...v, width }));
        }}
        onContentSizeChange={(content) => setView((v) => (v.content === content ? v : { ...v, content }))}
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
      {more.left && <Fade side="left" color={theme.background} />}
      {more.right && <Fade side="right" color={theme.background} />}
    </View>
  );
}

/** Background-colored gradient over one edge, solid at the edge and clear toward the middle. */
function Fade({ side, color }: { side: 'left' | 'right'; color: string }) {
  // useId's colons aren't valid in an SVG url() reference.
  const id = `fade${useId().replace(/:/g, '')}`;
  const [from, to] = side === 'left' ? [1, 0] : [0, 1];
  return (
    <View pointerEvents="none" style={[styles.fade, side === 'left' ? { left: 0 } : { right: 0 }]}>
      <Svg width={FADE_WIDTH} height={CHIP_HEIGHT}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={color} stopOpacity={from} />
            <Stop offset="1" stopColor={color} stopOpacity={to} />
          </LinearGradient>
        </Defs>
        <Rect width={FADE_WIDTH} height={CHIP_HEIGHT} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // Shrinks to fit beside whatever leads the row; grows no wider than its chips.
  container: { flexShrink: 1 },
  row: { gap: Spacing.two },
  chip: {
    minWidth: 56,
    height: CHIP_HEIGHT,
    paddingHorizontal: Spacing.three,
    borderRadius: CHIP_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  fade: { position: 'absolute', top: 0, bottom: 0, width: FADE_WIDTH },
});
