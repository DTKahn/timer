import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  ColorModeSwitch,
  ColorSwatches,
  gridWidth,
  MODE_SWITCH_HEIGHT,
  swatchOptions,
  useSwatchLayout,
} from '@/components/color-swatches';
import {
  PICKER_DONE_HEIGHT,
  PICKER_GAP,
  PICKER_HEADER_INLINE_HEIGHT,
  PICKER_TITLE_HEIGHT,
  PickerOverlay,
  usePickerHeaderInline,
} from '@/components/picker-overlay';
import { useSettings } from '@/store/settings';
import { sectorPath } from '@/timer/dial-geometry';

const HUES = Array.from({ length: 36 }, (_, i) => i * 10);
const STEP = (2 * Math.PI) / HUES.length;

/** Rainbow button that opens an overlay of color circles. */
export function ColorButton({ size = 52 }: { size?: number }) {
  const { color, multiColor, colors, setColor, toggleColor, setMultiColor } = useSettings();
  const [open, setOpen] = useState(false);
  const r = size / 2;
  const value = multiColor ? colors : [color];
  // Everything in the panel besides the circles, so they can size themselves to what's left.
  const inline = usePickerHeaderInline();
  const reserved = inline
    ? PICKER_HEADER_INLINE_HEIGHT + PICKER_GAP
    : PICKER_TITLE_HEIGHT + MODE_SWITCH_HEIGHT + 2 * PICKER_GAP + (multiColor ? PICKER_GAP + PICKER_DONE_HEIGHT : 0);
  const layout = useSwatchLayout(swatchOptions(value).length, reserved);

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

      <PickerOverlay
        visible={open}
        title="Color"
        label="color picker"
        onClose={() => setOpen(false)}
        accessory={<ColorModeSwitch multi={multiColor} accent={color} onChange={setMultiColor} />}
        // Picking several colors takes several taps, so closing is explicit.
        onDone={multiColor ? () => setOpen(false) : undefined}
        contentWidth={gridWidth(layout)}>
        <ColorSwatches
          value={value}
          multi={multiColor}
          layout={layout}
          onPress={(c) => {
            if (multiColor) return toggleColor(c);
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
