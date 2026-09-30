import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PickerOverlayProps = {
  visible: boolean;
  title: string;
  label: string;
  onClose: () => void;
  children: React.ReactNode;
};

/** Centered panel over a dimmed backdrop; tapping outside closes it. */
export function PickerOverlay({ visible, title, label, onClose, children }: PickerOverlayProps) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={`Close ${label}`}
        />
        <View style={[styles.panel, { backgroundColor: theme.face }]}>
          <ThemedText type="smallBold">{title}</ThemedText>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  backdrop: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  panel: {
    // Fits five 44px color swatches per row with 16px gaps, plus padding.
    width: 5 * 44 + 4 * Spacing.three + 2 * Spacing.four,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
});
