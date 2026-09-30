import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PickerOverlay } from '@/components/picker-overlay';
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
        <Icon
          name={
            sound === 'silent'
              ? { ios: 'speaker.slash.fill', web: 'volume_off' }
              : { ios: 'speaker.wave.2.fill', web: 'volume_up' }
          }
          size={22}
          color={theme.text}
        />
      </Pressable>

      <PickerOverlay visible={open} title="Sound when time is up" label="sound picker" onClose={close}>
        <View accessibilityRole="radiogroup" style={styles.list}>
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
                accessibilityState={{ checked: selected }}
                accessibilityLabel={s.name}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: selected ? color : theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold" style={[styles.rowText, selected && { color: contentColorOn(color) }]}>
                  {s.name}
                </ThemedText>
                {selected && (
                  <Icon name={{ ios: 'checkmark', web: 'check' }} size={18} color={contentColorOn(color)} />
                )}
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
  list: { gap: Spacing.two },
  row: {
    height: 48,
    borderRadius: 24,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: { fontSize: 16 },
  done: { alignSelf: 'center', paddingVertical: Spacing.two, paddingHorizontal: Spacing.four },
  pressed: { opacity: 0.7 },
});
