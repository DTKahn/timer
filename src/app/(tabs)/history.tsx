import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { recentTimes, useHistory } from '@/store/history';
import { useTimer } from '@/store/timer';
import { formatShort } from '@/timer/engine';

export default function HistoryScreen() {
  const entries = useHistory((s) => s.entries);
  const setDuration = useTimer((s) => s.setDuration);
  const theme = useTheme();

  return (
    <Screen>
      <FlatList
        data={recentTimes(entries)}
        keyExtractor={(ms) => String(ms)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListHeaderComponent={
          <ThemedText type="subtitle" style={styles.header}>
            History
          </ThemedText>
        }
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            Times you run show up here. Tap one to use it again.
          </ThemedText>
        }
        renderItem={({ item: ms }) => (
          <Pressable
            onPress={() => {
              setDuration(ms);
              router.navigate('/');
            }}
            accessibilityRole="button"
            accessibilityLabel={`Set timer to ${formatShort(ms)}`}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: pressed ? theme.backgroundElement : theme.face },
            ]}>
            <ThemedText style={styles.duration}>{formatShort(ms)}</ThemedText>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  header: { paddingVertical: Spacing.four },
  empty: { maxWidth: 420 },
  card: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
  },
  gap: { height: Spacing.two },
  duration: { fontSize: 20, lineHeight: 26, fontFamily: Fonts.bold },
});
