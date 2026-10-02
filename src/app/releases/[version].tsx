import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { ThemedText } from '@/components/themed-text';
import { RELEASES } from '@/constants/releases';
import { Spacing } from '@/constants/theme';

export default function ReleaseScreen() {
  const { version } = useLocalSearchParams<{ version: string }>();
  const release = RELEASES.find((r) => r.version === version);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/releases'));

  return (
    <Sheet title={`Version ${version}`} onBack={back}>
      <ScrollView contentContainerStyle={styles.content}>
        {release ? (
          <>
            <View style={styles.heading}>
              <ThemedText type="subtitle">{release.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {release.date}
              </ThemedText>
            </View>
            {release.changes.map((change) => (
              <View key={change} style={styles.change}>
                {release.changes.length > 1 && <ThemedText>•</ThemedText>}
                <ThemedText style={styles.changeText}>{change}</ThemedText>
              </View>
            ))}
          </>
        ) : (
          <ThemedText themeColor="textSecondary">There’s no version {version}.</ThemedText>
        )}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four, gap: Spacing.three },
  heading: { gap: Spacing.one, marginBottom: Spacing.two },
  change: { flexDirection: 'row', gap: Spacing.two },
  changeText: { flex: 1 },
});
