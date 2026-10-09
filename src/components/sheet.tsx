import { ChevronLeft, X, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Paper, PaperBackdrop } from '@/components/paper';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * A screen shown over the timer, with a back and/or close button: a big torn
 * sheet of paper laid on the background paper.
 */
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
  const theme = useTheme();
  return (
    <View style={[styles.outer, { backgroundColor: theme.background }]}>
      <PaperBackdrop color={theme.background} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.inner}>
          <Paper color={theme.face} seed={`sheet-${title}`} edge="torn" radius={4} elevation={2} tilt={0.3} />
          <View style={styles.header}>
            <View style={styles.side}>{onBack && <HeaderButton label="Back" icon={ChevronLeft} onPress={onBack} />}</View>
            <ThemedText type="smallBold" style={styles.title} numberOfLines={1}>
              {title}
            </ThemedText>
            <View style={[styles.side, styles.right]}>
              {onClose && <HeaderButton label="Close" icon={X} onPress={onClose} />}
            </View>
          </View>
          {/* Content scrolls inside the sheet, clear of its torn edges. */}
          <View style={styles.body}>{children}</View>
        </View>
      </SafeAreaView>
    </View>
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
  // A margin of background paper all round so the torn edge shows.
  safe: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.three - Spacing.one },
  inner: { flex: 1, width: '100%', maxWidth: MaxContentWidth, marginVertical: Spacing.three },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.two, paddingTop: Spacing.three },
  side: { width: 48 },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  button: { padding: Spacing.two },
  body: { flex: 1, marginBottom: Spacing.three, overflow: 'hidden' },
});
