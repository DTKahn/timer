import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Path } from 'react-native-svg';

import { ColorModeSwitch, ColorSwatches } from '@/components/color-swatches';
import { Paper } from '@/components/paper';
import { PickerDone, PickerOverlay } from '@/components/picker-overlay';
import { useSettings } from '@/store/settings';
import { sectorPath } from '@/timer/dial-geometry';

// Twelve slices of colored paper pieced into a disc.
const HUES = Array.from({ length: 12 }, (_, i) => i * 30);
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
        style={({ pressed }) => [{ width: size, height: size }, pressed && styles.pressed]}>
        {/* A disc cut from rainbow paper. */}
        <Paper
          color="#888"
          seed="color-button"
          radius="round"
          art={() =>
            HUES.map((hue, i) => (
              // Slight overlap hides hairline seams between slices.
              <Path key={hue} d={sectorPath(r, r, r + 2, i * STEP, (i + 1) * STEP + 0.02)} fill={`hsl(${hue}, 66%, 57%)`} />
            ))
          }
        />
      </Pressable>

      <PickerOverlay visible={open} title="Color" label="color picker" onClose={() => setOpen(false)}>
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
        {multiColor && <PickerDone onPress={() => setOpen(false)} />}
      </PickerOverlay>
    </>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
});
