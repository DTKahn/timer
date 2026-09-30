import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ColorSwatches } from '@/components/color-swatches';
import { PickerOverlay } from '@/components/picker-overlay';
import { useSettings } from '@/store/settings';
import { sectorPath } from '@/timer/dial-geometry';

const HUES = Array.from({ length: 36 }, (_, i) => i * 10);
const STEP = (2 * Math.PI) / HUES.length;

/** Rainbow button that opens an overlay of color circles. */
export function ColorButton({ size = 52 }: { size?: number }) {
  const { color, setColor } = useSettings();
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
        <ColorSwatches
          value={color}
          onChange={(c) => {
            setColor(c);
            setOpen(false);
          }}
        />
      </PickerOverlay>
    </>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
});
