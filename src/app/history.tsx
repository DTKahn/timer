import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Paper } from '@/components/paper';
import { Sheet } from '@/components/sheet';
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
  // Opened directly on the web there's nothing to go back to.
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Sheet title="History" onClose={close}>
      <FlatList
        data={recentTimes(entries)}
        keyExtractor={(ms) => String(ms)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            Times you run show up here. Tap one to use it again.
          </ThemedText>
        }
        renderItem={({ item: ms }) => (
          <Pressable
            onPress={() => {
              setDuration(ms);
              close();
            }}
            accessibilityRole="button"
            accessibilityLabel={`Set timer to ${formatShort(ms)}`}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}>
            <Paper color={theme.backgroundElement} seed={`history-${ms}`} radius={6} />
            <ThemedText style={styles.duration}>{formatShort(ms)}</ThemedText>
          </Pressable>
        )}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  empty: { maxWidth: 420 },
  card: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  gap: { height: Spacing.two },
  duration: { fontSize: 20, lineHeight: 26, fontFamily: Fonts.bold },
});
