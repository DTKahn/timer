import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { DurationEditor } from '@/components/duration-editor';
import { FAVORITES_SECTION_HEIGHT } from '@/components/favorites-section';
import { PieDial } from '@/components/pie-dial';
import { ThemedText } from '@/components/themed-text';
import { TIME_PICKER_HEIGHT } from '@/components/time-picker';
import { Fonts } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { dialColors, useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';
import { formatDuration, progress, remainingMs, splitDuration } from '@/timer/engine';
import { finishFlash } from '@/timer/finish-flash';

/** Height of the editor, reserved in every state so the dial never jumps. */
export const READOUT_HEIGHT = TIME_PICKER_HEIGHT;

/** Height reserved for the editing extras (favorites), shown or not. */
export const EXTRAS_HEIGHT = FAVORITES_SECTION_HEIGHT;

type TimerFaceProps = {
  size: number;
  onDraftEmptyChange: (empty: boolean) => void;
  /** Shown under the editor only while the time is editable, e.g. favorites. */
  editingExtras?: React.ReactNode;
};

/**
 * The dial, the time (editor or countdown), and the favorites as three
 * siblings, so the screen can space them like its other sections.
 */
export function TimerFace({ size, onDraftEmptyChange, editingExtras }: TimerFaceProps) {
  const timer = useTimer((s) => s.timer);
  const colors = useSettings(useShallow(dialColors));
  // Frame-by-frame clock while counting down and during the completion flash.
  const [flashClockOn, setFlashClockOn] = useState(false);
  const now = useNow(timer.status === 'running' || flashClockOn);
  const flash = finishFlash(timer, now);
  if (flash.active !== flashClockOn) setFlashClockOn(flash.active);

  // Stay in countdown mode until the flash ends, then switch to editing.
  const editable = (timer.status === 'idle' || timer.status === 'finished') && !flash.active;
  // After the flash, a finished timer shows a full disk, ready to start again.
  const fraction =
    flash.active ? (flash.lit ? 1 : 0) : timer.status === 'finished' ? 1 : progress(timer, now);

  const remaining = remainingMs(timer, now);
  const { hours, minutes, seconds } = splitDuration(remaining);
  const spoken = [hours && `${hours} hours`, minutes && `${minutes} minutes`, `${seconds} seconds`]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <View
        accessible
        accessibilityRole="timer"
        accessibilityLabel={`${spoken} remaining`}
        style={styles.dial}>
        <PieDial fraction={fraction} colors={colors} size={size} />
      </View>
      <View style={styles.readout}>
        {editable ? (
          <DurationEditor onEmptyChange={onDraftEmptyChange} />
        ) : (
          <ThemedText style={styles.countdown}>{formatDuration(remaining)}</ThemedText>
        )}
      </View>
      {/* Space stays reserved so the dial doesn't move when the extras hide. */}
      <View style={styles.extras}>{editable && editingExtras}</View>
    </>
  );
}

const styles = StyleSheet.create({
  dial: { alignSelf: 'center' },
  readout: { height: READOUT_HEIGHT, alignSelf: 'center', justifyContent: 'center' },
  // Full width (not sized to content) so the favorites row scrolls inside it.
  extras: { height: EXTRAS_HEIGHT, alignSelf: 'stretch' },
  countdown: {
    fontSize: 72,
    lineHeight: 84,
    fontFamily: Fonts.bold,
    fontVariant: ['tabular-nums'],
  },
});
