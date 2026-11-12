import { useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { SWATCH_GAP, SWATCH_SIZE } from '@/components/color-swatches';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PickerOverlayProps = {
  visible: boolean;
  title: string;
  label: string;
  onClose: () => void;
  /** Controls that sit beside the title on wide screens and under it otherwise. */
  accessory?: React.ReactNode;
  /** Shows a Done button, for pickers that take several taps. */
  onDone?: () => void;
  /** Width of the content inside the panel; defaults to four color swatches. */
  contentWidth?: number;
  children: React.ReactNode;
};

/**
 * Wider than tall (like a phone on its side): pickers put the title, accessory and Done
 * on one row so their options keep the little height there is.
 */
export function usePickerHeaderInline() {
  const { width, height } = useWindowDimensions();
  return width > height;
}

/** Height a picker's title row takes when inline, so content can size itself to what's left. */
export const PICKER_HEADER_INLINE_HEIGHT = 40;
export const PICKER_TITLE_HEIGHT = 20;
export const PICKER_DONE_HEIGHT = PICKER_TITLE_HEIGHT + 2 * Spacing.two;
export const PICKER_GAP = Spacing.three;

/**
 * Panel over a dimmed backdrop; tapping outside closes it. It opens centered,
 * then keeps its top edge in place so content that grows (like a Done button)
 * extends it downward instead of shifting it.
 */
export function PickerOverlay({
  visible,
  title,
  label,
  onClose,
  accessory,
  onDone,
  contentWidth = DEFAULT_CONTENT_WIDTH,
  children,
}: PickerOverlayProps) {
  const theme = useTheme();
  const inline = usePickerHeaderInline();
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
          style={[
            styles.panel,
            { width: contentWidth + 2 * PANEL_PADDING, backgroundColor: theme.face },
            top !== null && { marginTop: top },
          ]}>
          {inline ? (
            <View style={styles.header}>
              <ThemedText type="smallBold">{title}</ThemedText>
              {accessory}
              <View style={styles.spacer} />
              {onDone && <PickerDone onPress={onDone} inline />}
            </View>
          ) : (
            <>
              <ThemedText type="smallBold">{title}</ThemedText>
              {accessory}
            </>
          )}
          {children}
          {!inline && onDone && <PickerDone onPress={onDone} />}
        </View>
      </View>
    </Modal>
  );
}

/** Closes a picker that takes several taps; the same in every picker. */
function PickerDone({ onPress, inline = false }: { onPress: () => void; inline?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.done, !inline && styles.doneBelow, pressed && { opacity: 0.6 }]}>
      <ThemedText type="smallBold">Done</ThemedText>
    </Pressable>
  );
}

// ColorSwatches assumes these when shrinking swatches to fit.
const OVERLAY_PADDING = Spacing.four;
const PANEL_PADDING = Spacing.four;
// Four color swatches per row; on narrower screens they shrink to keep four.
const DEFAULT_CONTENT_WIDTH = 4 * SWATCH_SIZE + 3 * SWATCH_GAP;

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: OVERLAY_PADDING },
  backdrop: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: PICKER_GAP, minHeight: PICKER_HEADER_INLINE_HEIGHT },
  spacer: { flex: 1 },
  // The negative margin lines the text up with the panel's content edge while keeping a big tap area.
  done: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginRight: -Spacing.three,
  },
  doneBelow: { alignSelf: 'flex-end' },
  panel: {
    maxWidth: '100%',
    padding: PANEL_PADDING,
    borderRadius: Spacing.four,
    gap: PICKER_GAP,
  },
});
