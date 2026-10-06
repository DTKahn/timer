import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { SWATCH_GAP, SWATCH_SIZE } from '@/components/color-swatches';
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

/**
 * Panel over a dimmed backdrop; tapping outside closes it. It opens centered,
 * then keeps its top edge in place so content that grows (like a Done button)
 * extends it downward instead of shifting it.
 */
export function PickerOverlay({ visible, title, label, onClose, children }: PickerOverlayProps) {
  const theme = useTheme();
  // Distance from the top of the padded area where the panel first landed.
  const [top, setTop] = useState<number | null>(null);
  // Re-center on each open, not on close, so the panel holds still while it fades out.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setTop(null);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, top !== null && { justifyContent: 'flex-start' }]}>
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={`Close ${label}`}
        />
        <View
          onLayout={(e) => {
            if (top === null) setTop(e.nativeEvent.layout.y - OVERLAY_PADDING);
          }}
          style={[styles.panel, { backgroundColor: theme.face }, top !== null && { marginTop: top }]}>
          <ThemedText type="smallBold">{title}</ThemedText>
          {children}
        </View>
      </View>
    </Modal>
  );
}

/** Closes a picker that takes several taps; the same in every picker. */
export function PickerDone({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.done, pressed && { opacity: 0.6 }]}>
      <ThemedText type="smallBold">Done</ThemedText>
    </Pressable>
  );
}

const OVERLAY_PADDING = Spacing.four;

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: OVERLAY_PADDING },
  backdrop: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  // The negative margin lines the text up with the panel's content edge while keeping a big tap area.
  done: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginRight: -Spacing.three,
  },
  panel: {
    // Fits four color swatches per row, plus padding; narrower screens wrap to fewer.
    width: 4 * SWATCH_SIZE + 3 * SWATCH_GAP + 2 * Spacing.four,
    maxWidth: '100%',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
});
