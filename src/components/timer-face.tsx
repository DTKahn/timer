import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { DurationEditor } from '@/components/duration-editor';
import { FAVORITES_SECTION_HEIGHT } from '@/components/favorites-section';
import { PieDial } from '@/components/pie-dial';
import { ThemedText } from '@/components/themed-text';
import { TIME_PICKER_HEIGHT, TIME_PICKER_WIDTH } from '@/components/time-picker';
import { Fonts } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { dialColors, useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';
import { formatDuration, progress, remainingMs, splitDuration } from '@/timer/engine';
import { finishFlash } from '@/timer/finish-flash';

/** Height of the editor at full scale, reserved in every state so the dial never jumps. */
export const READOUT_HEIGHT = TIME_PICKER_HEIGHT;

/** Height reserved for the editing extras (favorites) at full scale, shown or not. */
export const EXTRAS_HEIGHT = FAVORITES_SECTION_HEIGHT;

/** Width of the editor at full scale; the countdown fits in it too. */
export const READOUT_WIDTH = TIME_PICKER_WIDTH;

type TimerFaceProps = {
  size: number;
  /** Multiplies the size of the time and the space reserved for the extras, to fit small screens. */
  scale?: number;
  /** Space between the editor and the extras. */
  gap?: number;
  onDraftEmptyChange: (empty: boolean) => void;
  /** Shown under the editor only while the time is editable, e.g. favorites. */
  editingExtras?: React.ReactNode;
  /** Arranges the two parts; by default they're stacked as siblings. */
  children?: (parts: { dial: React.ReactNode; time: React.ReactNode }) => React.ReactNode;
};

/**
 * The dial, and the time (editor and favorites, or countdown) as two
 * siblings, so the screen can space them like its other sections, or place
 * them itself through `children`.
 */
export function TimerFace({ size, scale = 1, gap = 0, onDraftEmptyChange, editingExtras, children }: TimerFaceProps) {
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

  const dial = (
    <View
      accessible
      accessibilityRole="timer"
      accessibilityLabel={`${spoken} remaining`}
      style={styles.dial}>
      <PieDial fraction={fraction} colors={colors} size={size} />
    </View>
  );
  // The same height in every state, so nothing around it moves when the extras hide.
  const time = (
    <View style={[styles.time, { height: (READOUT_HEIGHT + EXTRAS_HEIGHT) * scale + gap, gap }]}>
      {editable ? (
        <>
          <View style={[styles.editor, { height: READOUT_HEIGHT * scale }]}>
            <DurationEditor onEmptyChange={onDraftEmptyChange} scale={scale} />
          </View>
          <View style={[styles.extras, { height: EXTRAS_HEIGHT * scale }]}>{editingExtras}</View>
        </>
      ) : (
        // Counting down, there are no extras, so the time is centered in the whole space.
        <ThemedText style={[styles.countdown, { fontSize: 72 * scale, lineHeight: 84 * scale }]}>
          {formatDuration(remaining)}
        </ThemedText>
      )}
    </View>
  );

  if (children) return children({ dial, time });
  return (
    <>
      {dial}
      {time}
    </>
  );
}

const styles = StyleSheet.create({
  dial: { alignSelf: 'center' },
  time: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  editor: { justifyContent: 'center' },
  // Full width (not sized to content) so the favorites row scrolls inside it.
  extras: { alignSelf: 'stretch' },
  countdown: {
    fontFamily: Fonts.bold,
    fontVariant: ['tabular-nums'],
  },
});
