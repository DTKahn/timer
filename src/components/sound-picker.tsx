import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react-native';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { SWATCH_GAP, SWATCH_SIZE } from '@/components/color-swatches';
import { Paper } from '@/components/paper';
import { PickerDone, PickerOverlay } from '@/components/picker-overlay';
import { SoundIcon } from '@/components/sound-icon';
import { ThemedText } from '@/components/themed-text';
import { SOUNDS } from '@/constants/sounds';
import { Spacing } from '@/constants/theme';
import { contentColorOn, paperColor } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { playSound, preloadSounds, stopSounds } from '@/platform/sounds';
import { useSettings } from '@/store/settings';

/** Speaker button (crossed out when silent) that opens the completion sounds. */
export function SoundButton({ size = 52, iconSize = 22 }: { size?: number; iconSize?: number }) {
  const theme = useTheme();
  const { sound, setSound, color } = useSettings();
  const [open, setOpen] = useState(false);
  // Fill the panel's content width with PER_TOP_ROW circles; on narrow screens (like iPhone mini)
  // the panel shrinks to the room left after the overlay's and panel's Spacing.four padding.
  const { width } = useWindowDimensions();
  const content = Math.min(4 * SWATCH_SIZE + 3 * SWATCH_GAP, width - 4 * Spacing.four);
  const swatch = Math.floor((content - (PER_TOP_ROW - 1) * SWATCH_GAP) / PER_TOP_ROW);
  // Three on top, the rest centered below, so the last option isn't orphaned.
  const rows = [SOUNDS.slice(0, PER_TOP_ROW), SOUNDS.slice(PER_TOP_ROW)];

  const close = () => {
    stopSounds();
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => {
          preloadSounds();
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Change completion sound"
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size },
          pressed && styles.pressed,
        ]}>
        <Paper color={theme.backgroundElement} seed="sound" radius="round" />
        {sound === 'silent' ? (
          <VolumeX size={iconSize} color={theme.text} />
        ) : (
          <Volume2 size={iconSize} color={theme.text} />
        )}
      </Pressable>

      <PickerOverlay visible={open} title="Sound" label="sound picker" onClose={close}>
        <View accessibilityRole="radiogroup" style={styles.list}>
          {rows.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((s) => {
                const selected = s.id === sound;
                const iconColor = selected ? contentColorOn(paperColor(color)) : theme.text;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      setSound(s.id);
                      playSound(s.id); // Preview; the overlay stays open to try others.
                    }}
                    accessibilityRole="radio"
                    aria-checked={selected}
                    accessibilityLabel={s.name}
                    style={({ pressed }) => [styles.option, { width: swatch }, pressed && styles.pressed]}>
                    <View style={[styles.circle, { width: swatch, height: swatch }]}>
                      <Paper
                        color={selected ? paperColor(color) : theme.backgroundElement}
                        seed={`sound-${s.id}`}
                        radius="round"
                      />
                      <SoundIcon id={s.id} size={Math.round(swatch * ICON_RATIO)} color={iconColor} />
                    </View>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {s.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
        <PickerDone onPress={close} />
      </PickerOverlay>
    </>
  );
}

const ICON_RATIO = 0.5;
const PER_TOP_ROW = 3;

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  list: { gap: Spacing.three },
  row: { flexDirection: 'row', justifyContent: 'center', gap: SWATCH_GAP },
  option: { alignItems: 'center', gap: Spacing.one },
  circle: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
