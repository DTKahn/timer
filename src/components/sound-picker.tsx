import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { SWATCH_GAP, useSwatchSize } from '@/components/color-swatches';
import { PickerDone, PickerOverlay } from '@/components/picker-overlay';
import { SoundIcon } from '@/components/sound-icon';
import { ThemedText } from '@/components/themed-text';
import { SOUNDS } from '@/constants/sounds';
import { Spacing } from '@/constants/theme';
import { contentColorOn } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { playSound, preloadSounds, stopSounds } from '@/platform/sounds';
import { useSettings } from '@/store/settings';

/** Speaker button (crossed out when silent) that opens the completion sounds. */
export function SoundButton({ size = 52, iconSize = 22 }: { size?: number; iconSize?: number }) {
  const theme = useTheme();
  const { sound, setSound, color } = useSettings();
  const [open, setOpen] = useState(false);
  const swatch = useSwatchSize();
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
          { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}>
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
                const content = selected ? contentColorOn(color) : theme.text;
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
                    <View
                      style={[
                        styles.circle,
                        { width: swatch, height: swatch, borderRadius: swatch / 2 },
                        { backgroundColor: selected ? color : theme.backgroundElement },
                      ]}>
                      <SoundIcon id={s.id} size={ICON_SIZE} color={content} />
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

const ICON_SIZE = 32;
const PER_TOP_ROW = 3;

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  list: { gap: Spacing.three },
  row: { flexDirection: 'row', justifyContent: 'center', gap: SWATCH_GAP },
  option: { alignItems: 'center', gap: Spacing.one },
  circle: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
