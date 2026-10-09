import { Minus, Plus, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { CHIP_HEIGHT, DurationChips } from '@/components/duration-chips';
import { Paper } from '@/components/paper';
import { Spacing } from '@/constants/theme';
import { contentColorOn, paperColor } from '@/constants/timer-colors';
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
};

/** A star that adds or removes the current time, beside the scrolling saved times. */
export function FavoritesSection({ durationMs, color, disabled, onSelect }: FavoritesSectionProps) {
  const theme = useTheme();
  const { favorites, add, remove } = useFavorites();
  const favorite = favorites.find((f) => f.durationMs === durationMs);
  const label = formatShort(durationMs);
  const Sign = favorite ? Minus : Plus;
  const paper = paperColor(color);

  return (
    <View style={styles.row}>
      {/* Stays put while the favorites scroll beside it. */}
      <Pressable
        onPress={() => (favorite ? remove(favorite.id) : add(durationMs))}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={favorite ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
        style={({ pressed }) => [
          styles.star,
          { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
        ]}>
        <Paper color={theme.backgroundElement} seed="star" radius="round" />
        {/* Saved times get a filled star with a minus; others an outline with a plus. */}
        <Star size={30} color={favorite ? paper : theme.text} fill={favorite ? paper : 'none'} strokeWidth={1.75} />
        <View style={styles.sign} pointerEvents="none">
          <Sign size={13} strokeWidth={3} color={favorite ? contentColorOn(paper) : theme.text} />
        </View>
      </Pressable>
      <DurationChips
        durations={favorites.map((f) => f.durationMs)}
        selected={durationMs}
        color={color}
        onSelect={onSelect}
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
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  star: {
    width: CHIP_HEIGHT,
    height: CHIP_HEIGHT,
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
