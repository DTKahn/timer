import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ColorModeSwitch, ColorSwatches } from '@/components/color-swatches';
import { PickerOverlay } from '@/components/picker-overlay';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/store/settings';
import { sectorPath } from '@/timer/dial-geometry';

const HUES = Array.from({ length: 36 }, (_, i) => i * 10);
const STEP = (2 * Math.PI) / HUES.length;

/** Rainbow button that opens an overlay of color circles. */
export function ColorButton({ size = 52 }: { size?: number }) {
  const { color, multiColor, colors, setColor, toggleColor, setMultiColor } = useSettings();
  const [open, setOpen] = useState(false);
  const r = size / 2;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Change timer color"
        style={({ pressed }) => pressed && styles.pressed}>
        <Svg width={size} height={size}>
          {HUES.map((hue, i) => (
            // Slight overlap hides hairline seams between slices.
            <Path key={hue} d={sectorPath(r, r, r, i * STEP, (i + 1) * STEP + 0.02)} fill={`hsl(${hue}, 85%, 58%)`} />
          ))}
        </Svg>
      </Pressable>

      <PickerOverlay visible={open} title="Timer color" label="color picker" onClose={() => setOpen(false)}>
        <ColorModeSwitch multi={multiColor} accent={color} onChange={setMultiColor} />
        <ColorSwatches
          value={multiColor ? colors : [color]}
          multi={multiColor}
          onPress={(c) => {
            if (multiColor) return toggleColor(c);
            setColor(c);
            setOpen(false);
          }}
        />
        {/* Picking several colors takes several taps, so closing is explicit. */}
        {multiColor && (
          <Pressable
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.done, pressed && { opacity: 0.6 }]}>
            <ThemedText type="smallBold">Done</ThemedText>
          </Pressable>
        )}
      </PickerOverlay>
    </>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
  done: { alignSelf: 'flex-end', paddingVertical: Spacing.one, paddingHorizontal: Spacing.two },
});
