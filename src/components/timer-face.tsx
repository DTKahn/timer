import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DurationEditor } from '@/components/duration-editor';
import { PieDial } from '@/components/pie-dial';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';
import { formatDuration, progress, remainingMs, splitDuration } from '@/timer/engine';
import { finishFlash } from '@/timer/finish-flash';

/** Height of the editor, reserved in every state so the dial never jumps. */
export const READOUT_HEIGHT = 176;

/** Height reserved for the editing extras (favorites), shown or not. */
export const EXTRAS_HEIGHT = 40;

type TimerFaceProps = {
  size: number;
  onDraftEmptyChange: (empty: boolean) => void;
  /** Shown under the editor only while the time is editable, e.g. favorites. */
  editingExtras?: React.ReactNode;
};

export function TimerFace({ size, onDraftEmptyChange, editingExtras }: TimerFaceProps) {
  const timer = useTimer((s) => s.timer);
  const color = useSettings((s) => s.color);
  // Frame-by-frame clock while counting down and during the completion flash.
  const [flashClockOn, setFlashClockOn] = useState(false);
  const now = useNow(timer.status === 'running' || flashClockOn);
  const flash = finishFlash(timer, now);
  if (flash.active !== flashClockOn) setFlashClockOn(flash.active);

  // Stay in countdown mode until the flash ends, then switch to editing.
  const editable = (timer.status === 'idle' || timer.status === 'finished') && !flash.active;
  const fraction = flash.active ? (flash.lit ? 1 : 0) : progress(timer, now);

  const remaining = remainingMs(timer, now);
  const { hours, minutes, seconds } = splitDuration(remaining);
  const spoken = [hours && `${hours} hours`, minutes && `${minutes} minutes`, `${seconds} seconds`]
    .filter(Boolean)
    .join(' ');

  return (
    <View style={styles.container}>
      <View accessible accessibilityRole="timer" accessibilityLabel={`${spoken} remaining`}>
        <PieDial fraction={fraction} color={color} size={size} />
      </View>
      <View style={styles.readout}>
        {editable ? (
          <DurationEditor onEmptyChange={onDraftEmptyChange} />
        ) : (
          <ThemedText style={styles.time}>{formatDuration(remaining)}</ThemedText>
        )}
      </View>
      {/* Space stays reserved so the dial doesn't move when the extras hide. */}
      <View style={styles.extras}>{editable && editingExtras}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full width (not sized to content) so the favorites row scrolls inside it.
  container: { alignSelf: 'stretch', alignItems: 'center', gap: Spacing.two },
  readout: { height: READOUT_HEIGHT, justifyContent: 'center' },
  extras: { height: EXTRAS_HEIGHT, alignSelf: 'stretch' },
  time: {
    fontSize: 72,
    lineHeight: 84,
    fontFamily: Fonts.bold,
    fontVariant: ['tabular-nums'],
  },
});
