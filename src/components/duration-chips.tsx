import { useId, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Mask, Rect, Stop } from 'react-native-svg';

import { Grain, Paper } from '@/components/paper';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { contentColorOn, paperColor } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { formatShort } from '@/timer/engine';

export const CHIP_HEIGHT = 40;
const FADE_WIDTH = 32;
const BLEED = 6;

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
  const paper = paperColor(color);
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
                pressed && styles.pressed,
              ]}>
              <Paper
                color={active ? paper : theme.backgroundElement}
                seed={`chip-${ms}`}
                radius="round"
              />
              <ThemedText type="smallBold" style={active && { color: contentColorOn(paper) }}>
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

/**
 * Background paper over one edge, solid at the edge and clear toward the
 * middle. It carries the paper's grain so it doesn't show as a flat band.
 */
function Fade({ side, color }: { side: 'left' | 'right'; color: string }) {
  // useId's colons aren't valid in an SVG url() reference.
  const id = `fade${useId().replace(/:/g, '')}`;
  const [from, to] = side === 'left' ? [1, 0] : [0, 1];
  const height = CHIP_HEIGHT + BLEED * 2;
  return (
    <View pointerEvents="none" style={[styles.fade, side === 'left' ? { left: -BLEED } : { right: -BLEED }]}>
      <Svg width={FADE_WIDTH} height={height}>
        <Defs>
          <LinearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#fff" stopOpacity={from} />
            <Stop offset="1" stopColor="#fff" stopOpacity={to} />
          </LinearGradient>
          <Mask id={`${id}m`} maskUnits="userSpaceOnUse" x={0} y={0} width={FADE_WIDTH} height={height}>
            <Rect width={FADE_WIDTH} height={height} fill={`url(#${id}g)`} />
          </Mask>
        </Defs>
        <G mask={`url(#${id}m)`}>
          <Rect width={FADE_WIDTH} height={height} fill={color} />
          <Grain color={color} width={FADE_WIDTH} height={height} seed={`fade-${side}`} />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // Shrinks to fit beside whatever leads the row; grows no wider than its chips.
  container: { flexShrink: 1 },
  // Room inside the scroll view for the chips' shadows, taken back with a negative margin.
  scroll: { marginVertical: -BLEED, marginHorizontal: -BLEED },
  row: { gap: Spacing.two, padding: BLEED },
  chip: {
    minWidth: 56,
    height: CHIP_HEIGHT,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  fade: { position: 'absolute', top: -BLEED, bottom: -BLEED, width: FADE_WIDTH },
});
