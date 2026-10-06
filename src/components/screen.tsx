import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth } from '@/constants/theme';

/** Full-height screen, centered and width-capped for large web windows. */
export function Screen({ style, children, ...rest }: ViewProps) {
  return (
    <ThemedView style={styles.outer}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={[styles.inner, style]} {...rest}>
          {children}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  safe: { flex: 1, alignItems: 'center' },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
});
