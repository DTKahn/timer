import { Minus, Plus, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { CHIP_HEIGHT, DurationChips } from '@/components/duration-chips';
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
};

/** The saved times, led by a star that adds or removes the current time. */
export function FavoritesSection({ durationMs, color, disabled, onSelect }: FavoritesSectionProps) {
  const theme = useTheme();
  const { favorites, add, remove } = useFavorites();
  const favorite = favorites.find((f) => f.durationMs === durationMs);
  const label = formatShort(durationMs);
  const Sign = favorite ? Minus : Plus;

  return (
    <DurationChips
      durations={favorites.map((f) => f.durationMs)}
      selected={durationMs}
      color={color}
      onSelect={onSelect}
      leading={
        <Pressable
          onPress={() => (favorite ? remove(favorite.id) : add(durationMs))}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={favorite ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
          style={({ pressed }) => [
            styles.star,
            { backgroundColor: theme.backgroundElement, opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
          ]}>
          {/* Saved times get a filled star with a minus; others an outline with a plus. */}
          <Star size={30} color={favorite ? color : theme.text} fill={favorite ? color : 'none'} strokeWidth={1.75} />
          <View style={styles.sign} pointerEvents="none">
            <Sign size={13} strokeWidth={3} color={favorite ? contentColorOn(color) : theme.text} />
          </View>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  star: {
    width: CHIP_HEIGHT,
    height: CHIP_HEIGHT,
    borderRadius: CHIP_HEIGHT / 2,
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
