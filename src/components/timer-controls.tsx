import { Pause, Play, RotateCcw } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ColorButton } from '@/components/color-picker';
import { SoundButton } from '@/components/sound-picker';
import { Spacing } from '@/constants/theme';
import { contentColorOn } from '@/constants/timer-colors';
import { requestAlertPermission } from '@/platform/alerts';
import { prepareSound } from '@/platform/sounds';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';

const PRIMARY = {
  idle: { label: 'Start', Glyph: Play },
  running: { label: 'Pause', Glyph: Pause },
  paused: { label: 'Resume', Glyph: Play },
  finished: { label: 'Start again', Glyph: Play },
};

/** The circles and the start button share one height. */
const SIZE = 72;
const ICON = 30;

/** Height of the controls block, so the timer screen can size the dial around it. */
export const CONTROLS_HEIGHT = SIZE * 2 + Spacing.three;

/** Color, sound, and reset as circles on top; an icon-only start/pause fills the bottom row. */
export function TimerControls({ canStart }: { canStart: boolean }) {
  const theme = useTheme();
  const color = useSettings((s) => s.color);
  const sound = useSettings((s) => s.sound);
  const { timer, start, pause, resume, reset } = useTimer();
  const primary = PRIMARY[timer.status];
  const canReset = timer.status !== 'idle';
  const primaryDisabled = !canStart && (timer.status === 'idle' || timer.status === 'finished');
  const content = contentColorOn(color);

  const startWithAlerts = () => {
    // Ask on the first start, from the tap itself, so the prompt has context.
    requestAlertPermission().catch(() => {});
    prepareSound(sound);
    start();
  };
  // Resume can be the first tap after a reload, so the sound needs readying here too.
  const resumeWithSound = () => {
    prepareSound(sound);
    resume();
  };
  const onPrimary = { idle: startWithAlerts, running: pause, paused: resumeWithSound, finished: startWithAlerts }[
    timer.status
  ];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ColorButton size={SIZE} />
        <SoundButton size={SIZE} iconSize={ICON} />
        <Pressable
          onPress={reset}
          disabled={!canReset}
          accessibilityRole="button"
          accessibilityLabel="Reset"
          style={({ pressed }) => [
            styles.circle,
            { backgroundColor: theme.backgroundElement, opacity: canReset ? 1 : 0.35 },
            pressed && styles.pressed,
          ]}>
          <RotateCcw size={ICON} color={theme.text} />
        </Pressable>
      </View>
      <Pressable
        onPress={onPrimary}
        disabled={primaryDisabled}
        accessibilityRole="button"
        accessibilityLabel={primary.label}
        style={({ pressed }) => [
          styles.primary,
          { backgroundColor: color, opacity: primaryDisabled ? 0.4 : 1 },
          pressed && styles.primaryPressed,
        ]}>
        <primary.Glyph size={ICON} color={content} fill={content} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 420, alignSelf: 'center', paddingHorizontal: Spacing.four, gap: Spacing.three },
  row: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.three },
  circle: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center' },
  primary: { height: SIZE, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.85 },
  // A gentler squeeze, since a wide button shrinking 6% moves its edges a lot.
  primaryPressed: { transform: [{ scale: 0.98 }], opacity: 0.85 },
});
