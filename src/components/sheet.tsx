import { ChevronLeft, X, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** A screen shown over the tabs, with a back and/or close button. */
export function Sheet({
  title,
  onBack,
  onClose,
  children,
}: {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  return (
    <ThemedView style={styles.outer}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <View style={styles.side}>{onBack && <HeaderButton label="Back" icon={ChevronLeft} onPress={onBack} />}</View>
            <ThemedText type="smallBold" style={styles.title} numberOfLines={1}>
              {title}
            </ThemedText>
            <View style={[styles.side, styles.right]}>
              {onClose && <HeaderButton label="Close" icon={X} onPress={onClose} />}
            </View>
          </View>
          {children}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function HeaderButton({ label, icon: Glyph, onPress }: { label: string; icon: LucideIcon; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}>
      <Glyph size={24} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  safe: { flex: 1, alignItems: 'center' },
  inner: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.two },
  side: { width: 48 },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  button: { padding: Spacing.two },
});
