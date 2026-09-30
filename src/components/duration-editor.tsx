import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StarIcon } from '@/components/star-icon';
import { TimePicker } from '@/components/time-picker';
import { useTheme } from '@/hooks/use-theme';
import { useFavorites } from '@/store/favorites';
import { useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';
import { formatShort, joinDuration, splitDuration } from '@/timer/engine';

/**
 * Inline hours/minutes/seconds editor bound to the timer's duration. Edits
 * apply immediately; an all-zero entry stays local (a timer can't be 0s) and
 * is reported through `onEmptyChange` so Start can be disabled. The star
 * beside the fields saves the time as a favorite (or removes it).
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
    <View style={styles.row}>
      {/* Balances the star so the fields stay centered under the dial. */}
      <View style={styles.side} />
      <TimePicker
        value={draft.parts}
        onChange={(parts) => {
          const ms = joinDuration(parts);
          if (ms > 0 && ms !== durationMs) setDuration(ms);
          setDraft({ parts, from: ms > 0 ? ms : durationMs });
        }}
      />
      <View style={styles.side}>
        <FavoriteStar durationMs={durationMs} disabled={empty} />
      </View>
    </View>
  );
}

function FavoriteStar({ durationMs, disabled }: { durationMs: number; disabled: boolean }) {
  const theme = useTheme();
  const color = useSettings((s) => s.color);
  const { favorites, add, remove } = useFavorites();
  const favorite = favorites.find((f) => f.durationMs === durationMs);
  const label = formatShort(durationMs);

  return (
    <Pressable
      onPress={() => (favorite ? remove(favorite.id) : add(durationMs))}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={favorite ? `Remove ${label} from favorites` : `Save ${label} as a favorite`}
      accessibilityState={{ selected: !!favorite, disabled }}
      hitSlop={8}
      style={({ pressed }) => [styles.star, { opacity: disabled ? 0.3 : pressed ? 0.6 : 1 }]}>
      <StarIcon filled={!!favorite} size={28} color={favorite ? color : theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  side: { width: 40, alignItems: 'center' },
  // Lines up with the number boxes rather than the whole column (see TimePicker colon).
  star: { padding: 4, marginBottom: 24 },
});
