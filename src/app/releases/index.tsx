import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { ThemedText } from '@/components/themed-text';
import { RELEASES } from '@/constants/releases';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ReleasesScreen() {
  const theme = useTheme();
  // Opened directly on the web there's nothing to go back to.
  const close = () => (router.canGoBack() ? router.back() : router.replace('/settings'));

  return (
    <Sheet title="Versions" onClose={close}>
      <ScrollView contentContainerStyle={styles.list}>
        {RELEASES.map((r) => (
          <Pressable
            key={r.version}
            onPress={() => router.push({ pathname: '/releases/[version]', params: { version: r.version } })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, { borderColor: theme.backgroundElement }, pressed && { opacity: 0.6 }]}>
            <View style={styles.text}>
              <ThemedText type="small" themeColor="textSecondary">
                {r.version} – {r.date}
              </ThemedText>
              <ThemedText>{r.name}</ThemedText>
            </View>
            <ChevronRight size={20} color={theme.textSecondary} />
          </Pressable>
        ))}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, gap: Spacing.half },
});
