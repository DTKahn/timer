import { Minus, Plus, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { CHIP_HEIGHT, DurationChips } from '@/components/duration-chips';
import { Spacing } from '@/constants/theme';
import { contentColorOn } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { useFavorites } from '@/store/favorites';
import { formatShort } from '@/timer/engine';

export const FAVORITES_SECTION_HEIGHT = CHIP_HEIGHT;

type FavoritesSectionProps = {
  /** The time on the timer, which the star adds or removes. */
  durationMs: number;
  color: string;
  /** True while the entered time is all zeros, so there's nothing to save. */
  disabled: boolean;
  onSelect: (durationMs: number) => void;
  /** Multiplies the star's and chips' size, so they fit small screens. */
  scale?: number;
};

/** A star that adds or removes the current time, beside the scrolling saved times. */
export function FavoritesSection({ durationMs, color, disabled, onSelect, scale = 1 }: FavoritesSectionProps) {
  const theme = useTheme();
  const { favorites, add, remove } = useFavorites();
  const favorite = favorites.find((f) => f.durationMs === durationMs);
  const label = formatShort(durationMs);
  const Sign = favorite ? Minus : Plus;
  const star = CHIP_HEIGHT * scale;

  return (
    <View style={[styles.row, { gap: Spacing.two * scale }]}>
      {/* Stays put while the favorites scroll beside it. */}
      <Pressable
        onPress={() => (favorite ? remove(favorite.id) : add(durationMs))}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={favorite ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
        style={({ pressed }) => [
          styles.star,
          { width: star, height: star, borderRadius: star / 2 },
          { backgroundColor: theme.backgroundElement, opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
        ]}>
        {/* Saved times get a filled star with a minus; others an outline with a plus. */}
        <Star size={30 * scale} color={favorite ? color : theme.text} fill={favorite ? color : 'none'} strokeWidth={1.75} />
        <View style={styles.sign} pointerEvents="none">
          <Sign size={13 * scale} strokeWidth={3} color={favorite ? contentColorOn(color) : theme.text} />
        </View>
      </Pressable>
      <DurationChips
        durations={favorites.map((f) => f.durationMs)}
        selected={durationMs}
        color={color}
        onSelect={onSelect}
        scale={scale}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Star and chips centered together; the chips shrink and scroll when they don't fit.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  star: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Centered on the star's body, which sits a little below the middle of its box.
  sign: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
});
