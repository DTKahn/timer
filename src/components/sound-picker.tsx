import { useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { PickerDone, PickerOverlay } from '@/components/picker-overlay';
import { SoundIcon } from '@/components/sound-icon';
import { ThemedText } from '@/components/themed-text';
import { SOUNDS } from '@/constants/sounds';
import { Spacing } from '@/constants/theme';
import { contentColorOn } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { playSound, stopSounds } from '@/platform/sounds';
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
        onPress={() => setOpen(true)}
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

      <PickerOverlay visible={open} title="Sound when time is up" label="sound picker" onClose={close}>
        <View accessibilityRole="radiogroup" style={styles.list}>
          {SOUNDS.map((s) => {
            const selected = s.id === sound;
            const content = selected ? contentColorOn(color) : theme.text;
            return (
              <View key={s.id} style={styles.row}>
                <Pressable
                  onPress={() => setSound(s.id)}
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
                {/* Silent has nothing to hear; the spacer keeps its row as wide as the rest. */}
                {s.id === 'silent' ? (
                  <View style={styles.play} />
                ) : (
                  <Pressable
                    onPress={() => playSound(s.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Play ${s.name}`}
                    style={({ pressed }) => [
                      styles.play,
                      { backgroundColor: theme.backgroundElement },
                      pressed && styles.pressed,
                    ]}>
                    <Play size={20} color={theme.text} fill={theme.text} />
                  </Pressable>
                )}
              </View>
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
  row: { flexDirection: 'row', gap: Spacing.two },
  option: {
    flex: 1,
    height: ROW_HEIGHT,
    borderRadius: ROW_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  play: {
    width: ROW_HEIGHT,
    height: ROW_HEIGHT,
    borderRadius: ROW_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
