import { Pause, Play, RotateCcw } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ColorButton } from '@/components/color-picker';
import { SoundButton } from '@/components/sound-picker';
import { Spacing } from '@/constants/theme';
import { contentColorOn } from '@/constants/timer-colors';
import { requestAlertPermission } from '@/platform/alerts';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';

const PRIMARY = {
  idle: { label: 'Start', Glyph: Play },
  running: { label: 'Pause', Glyph: Pause },
  paused: { label: 'Resume', Glyph: Play },
  finished: { label: 'Start again', Glyph: Play },
};

/**
 * Color and sound on the left, start/pause in the center, reset on the right.
 * Both sides are the same width so the main button stays centered.
 */
export function TimerControls({ canStart }: { canStart: boolean }) {
  const theme = useTheme();
  const color = useSettings((s) => s.color);
  const { timer, start, pause, resume, reset } = useTimer();
  const primary = PRIMARY[timer.status];
  const canReset = timer.status !== 'idle';
  const primaryDisabled = !canStart && (timer.status === 'idle' || timer.status === 'finished');

  const startWithAlerts = () => {
    // Ask on the first start, from the tap itself, so the prompt has context.
    requestAlertPermission().catch(() => {});
    start();
  };
  const onPrimary = { idle: startWithAlerts, running: pause, paused: resume, finished: startWithAlerts }[
    timer.status
  ];

  return (
    <View style={styles.row}>
      <View style={[styles.side, styles.sideLeft]}>
        <ColorButton />
        <SoundButton />
      </View>
      <Pressable
        onPress={onPrimary}
        disabled={primaryDisabled}
        accessibilityRole="button"
        accessibilityLabel={primary.label}
        style={({ pressed }) => [
          styles.primary,
          { backgroundColor: color, opacity: primaryDisabled ? 0.4 : 1 },
          pressed && styles.pressed,
        ]}>
        <primary.Glyph size={32} color={contentColorOn(color)} fill={contentColorOn(color)} />
      </Pressable>
      <View style={styles.side}>
        <Pressable
          onPress={reset}
          disabled={!canReset}
          accessibilityRole="button"
          accessibilityLabel="Reset"
          style={({ pressed }) => [
            styles.secondary,
            { backgroundColor: theme.backgroundElement, opacity: canReset ? 1 : 0.35 },
            pressed && styles.pressed,
          ]}>
          <RotateCcw size={22} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  side: { width: 52 * 2 + Spacing.two, flexDirection: 'row', gap: Spacing.two },
  sideLeft: { justifyContent: 'flex-end' },
  primary: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  secondary: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.85 },
});
