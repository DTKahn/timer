import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { PickerOverlay } from '@/components/picker-overlay';
import { SoundIcon } from '@/components/sound-icon';
import { ThemedText } from '@/components/themed-text';
import { SOUNDS } from '@/constants/sounds';
import { Spacing } from '@/constants/theme';
import { contentColorOn } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { playSound, stopSounds } from '@/platform/sounds';
import { useSettings } from '@/store/settings';

/** Speaker button (crossed out when silent) that opens the completion sounds. */
export function SoundButton({ size = 52 }: { size?: number }) {
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
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Change completion sound"
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}>
        {sound === 'silent' ? <VolumeX size={22} color={theme.text} /> : <Volume2 size={22} color={theme.text} />}
      </Pressable>

      <PickerOverlay visible={open} title="Sound when time is up" label="sound picker" onClose={close}>
        <View accessibilityRole="radiogroup" style={styles.grid}>
          {SOUNDS.map((s) => {
            const selected = s.id === sound;
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
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
                <View
                  style={[styles.circle, { backgroundColor: selected ? color : theme.backgroundElement }]}>
                  <SoundIcon id={s.id} size={26} color={selected ? contentColorOn(color) : theme.text} />
                </View>
                <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                  {s.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          style={({ pressed }) => [styles.done, pressed && styles.pressed]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Done
          </ThemedText>
        </Pressable>
      </PickerOverlay>
    </>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  option: { alignItems: 'center', gap: Spacing.one },
  circle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  done: { alignSelf: 'center', paddingVertical: Spacing.two, paddingHorizontal: Spacing.four },
  pressed: { opacity: 0.7 },
});
