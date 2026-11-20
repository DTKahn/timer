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

/** The circles and the start button share one height. Sizes at full scale. */
const SIZE = 72;
const ICON = 30;

/** Height of the controls block at full scale, so the timer screen can size the dial around it. */
export const CONTROLS_HEIGHT = SIZE * 2 + Spacing.three;

/**
 * Color, sound, and reset as circles on top; an icon-only start/pause fills the bottom row.
 * `scale` multiplies their size, so they fit small screens.
 */
export function TimerControls({ canStart, scale = 1 }: { canStart: boolean; scale?: number }) {
  const theme = useTheme();
  const color = useSettings((s) => s.color);
  const sound = useSettings((s) => s.sound);
  const { timer, start, pause, resume, reset } = useTimer();
  const primary = PRIMARY[timer.status];
  const canReset = timer.status !== 'idle';
  const primaryDisabled = !canStart && (timer.status === 'idle' || timer.status === 'finished');
  const content = contentColorOn(color);
  const size = SIZE * scale;
  const icon = ICON * scale;
  const gap = { gap: Spacing.three * scale };

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
    <View style={[styles.container, gap]}>
      <View style={[styles.row, gap]}>
        <ColorButton size={size} />
        <SoundButton size={size} iconSize={icon} />
        <Pressable
          onPress={reset}
          disabled={!canReset}
          accessibilityRole="button"
          accessibilityLabel="Reset"
          style={({ pressed }) => [
            styles.circle,
            { width: size, height: size, borderRadius: size / 2 },
            { backgroundColor: theme.backgroundElement, opacity: canReset ? 1 : 0.35 },
            pressed && styles.pressed,
          ]}>
          <RotateCcw size={icon} color={theme.text} />
        </Pressable>
      </View>
      <Pressable
        onPress={onPrimary}
        disabled={primaryDisabled}
        accessibilityRole="button"
        accessibilityLabel={primary.label}
        style={({ pressed }) => [
          styles.primary,
          { height: size, borderRadius: size / 2 },
          { backgroundColor: color, opacity: primaryDisabled ? 0.4 : 1 },
          pressed && styles.primaryPressed,
        ]}>
        <primary.Glyph size={icon} color={content} fill={content} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 420, alignSelf: 'center', paddingHorizontal: Spacing.four },
  row: { flexDirection: 'row', justifyContent: 'center' },
  circle: { alignItems: 'center', justifyContent: 'center' },
  primary: { alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.85 },
  // A gentler squeeze, since a wide button shrinking 6% moves its edges a lot.
  primaryPressed: { transform: [{ scale: 0.98 }], opacity: 0.85 },
});
