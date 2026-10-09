import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaperBackdrop } from '@/components/paper';
import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Full-height screen on a sheet of background paper, centered and width-capped for large web windows. */
export function Screen({ style, children, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View style={[styles.outer, { backgroundColor: theme.background }]}>
      <PaperBackdrop color={theme.background} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={[styles.inner, style]} {...rest}>
          {children}
        </View>
      </SafeAreaView>
    </View>
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
