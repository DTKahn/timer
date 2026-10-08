import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

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
          {SOUNDS.map((s) => {
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
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: selected ? color : theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <SoundIcon id={s.id} size={24} color={content} />
                <ThemedText type="smallBold" style={{ color: content }}>
                  {s.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        <PickerDone onPress={close} />
      </PickerOverlay>
    </>
  );
}

const ROW_HEIGHT = 52;

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  list: { gap: Spacing.two },
  option: {
    height: ROW_HEIGHT,
    borderRadius: ROW_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  pressed: { opacity: 0.7 },
});
