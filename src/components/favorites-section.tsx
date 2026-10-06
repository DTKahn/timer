import { Pressable, StyleSheet, View } from 'react-native';

import { DurationChips } from '@/components/duration-chips';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFavorites } from '@/store/favorites';
import { formatShort } from '@/timer/engine';

const HEADER_HEIGHT = 28;
const CHIPS_HEIGHT = 40;

/** Heading, gap, and the row of favorites. */
export const FAVORITES_SECTION_HEIGHT = HEADER_HEIGHT + Spacing.two + CHIPS_HEIGHT;

type FavoritesSectionProps = {
  /** The time on the timer, which the button adds or removes. */
  durationMs: number;
  color: string;
  /** True while the entered time is all zeros, so there's nothing to save. */
  disabled: boolean;
  onSelect: (durationMs: number) => void;
};

/** "Favorites" with an Add/Remove button for the current time, over the saved times. */
export function FavoritesSection({ durationMs, color, disabled, onSelect }: FavoritesSectionProps) {
  const theme = useTheme();
  const { favorites, add, remove } = useFavorites();
  const favorite = favorites.find((f) => f.durationMs === durationMs);
  const label = formatShort(durationMs);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="smallBold">Favorites</ThemedText>
        <Pressable
          onPress={() => (favorite ? remove(favorite.id) : add(durationMs))}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={favorite ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
          hitSlop={8}
          style={({ pressed }) => [
            styles.toggle,
            { backgroundColor: theme.backgroundElement, opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
          ]}>
          <ThemedText type="small">{favorite ? 'Remove' : 'Add'}</ThemedText>
        </Pressable>
      </View>
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
  section: { gap: Spacing.two },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  toggle: {
    height: HEADER_HEIGHT,
    paddingHorizontal: Spacing.three,
    borderRadius: HEADER_HEIGHT / 2,
    justifyContent: 'center',
  },
});
