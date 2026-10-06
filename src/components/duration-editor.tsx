import { useEffect, useState } from 'react';

import { TimePicker } from '@/components/time-picker';
import { useTimer } from '@/store/timer';
import { joinDuration, splitDuration } from '@/timer/engine';

/**
 * Inline hours/minutes/seconds editor bound to the timer's duration. Edits
 * apply immediately; an all-zero entry stays local (a timer can't be 0s) and
 * is reported through `onEmptyChange` so Start can be disabled.
 */
export function DurationEditor({ onEmptyChange }: { onEmptyChange: (empty: boolean) => void }) {
  const durationMs = useTimer((s) => s.timer.durationMs);
  const setDuration = useTimer((s) => s.setDuration);
  const [draft, setDraft] = useState({ parts: splitDuration(durationMs), from: durationMs });

  // The duration changed elsewhere (e.g. a favorite was tapped): show it.
  if (draft.from !== durationMs) setDraft({ parts: splitDuration(durationMs), from: durationMs });

  const empty = joinDuration(draft.parts) === 0;
  useEffect(() => {
    onEmptyChange(empty);
    return () => onEmptyChange(false);
  }, [empty, onEmptyChange]);

  return (
    <TimePicker
      value={draft.parts}
      onChange={(parts) => {
        const ms = joinDuration(parts);
        if (ms > 0 && ms !== durationMs) setDuration(ms);
        setDraft({ parts, from: ms > 0 ? ms : durationMs });
      }}
    />
  );
}
