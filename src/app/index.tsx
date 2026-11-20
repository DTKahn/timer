import { router } from 'expo-router';
import { History, Settings, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import {
  Keyboard,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoritesSection } from '@/components/favorites-section';
import { Screen } from '@/components/screen';
import { CONTROLS_HEIGHT, TimerControls } from '@/components/timer-controls';
import { EXTRAS_HEIGHT, READOUT_HEIGHT, READOUT_WIDTH, TimerFace } from '@/components/timer-face';
import { TOP_BAR_HEIGHT, timerLayout } from '@/components/timer-layout';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';

type Size = { width: number; height: number };

/** The time, favorites, and buttons at full size, which the layout shrinks to fit. */
const SECTIONS: Size = { width: READOUT_WIDTH, height: READOUT_HEIGHT + EXTRAS_HEIGHT + CONTROLS_HEIGHT };

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const color = useSettings((s) => s.color);
  const timer = useTimer((s) => s.timer);
  const setDuration = useTimer((s) => s.setDuration);
  const [draftEmpty, setDraftEmpty] = useState(false);

  // Everything is sized to the space the screen actually gets, measured after every change. The
  // window's size is only a first guess: in iOS Safari it can lag behind after turning the phone.
  const [measured, setMeasured] = useState<Size | null>(null);
  const space = measured ?? {
    width: Math.min(window.width - insets.left - insets.right, MaxContentWidth),
    height: window.height - insets.top - insets.bottom,
  };
  const layout = timerLayout(space, SECTIONS);
  const onLayout = ({ nativeEvent: { layout: box } }: LayoutChangeEvent) =>
    setMeasured((m) => (m?.width === box.width && m.height === box.height ? m : { width: box.width, height: box.height }));

  const topBar = (
    <View style={styles.topBar}>
      <TopButton label="History" icon={History} onPress={() => router.push('/history')} />
      <TopButton label="Settings" icon={Settings} onPress={() => router.push('/settings')} />
    </View>
  );
  const favorites = (
    <FavoritesSection
      durationMs={timer.durationMs}
      color={color}
      disabled={draftEmpty}
      onSelect={setDuration}
      scale={layout.scale}
    />
  );
  const controls = <TimerControls canStart={!draftEmpty} scale={layout.scale} />;
  const spacing = { gap: layout.gap, paddingBottom: layout.bottom };

  // Both arrangements share one tree, only restyled, so turning the phone keeps what's on screen
  // (like an open picker) instead of rebuilding it.
  const { sideways } = layout;
  const content = (
    <Screen onLayout={onLayout}>
      {/* Sideways, it sits in the screen's corner, over the space the column leaves at its top. */}
      <View style={sideways && styles.corner}>{topBar}</View>
      <TimerFace
        size={layout.dial}
        scale={layout.scale}
        gap={layout.gap}
        onDraftEmptyChange={setDraftEmpty}
        editingExtras={favorites}>
        {({ dial, time }) => (
          <View style={[styles.body, sideways ? styles.row : { gap: layout.gap }]}>
            <View style={[styles.center, styles.dialBox, { width: layout.dialBox, height: layout.dialBox }]}>
              {dial}
            </View>
            <View style={[spacing, sideways ? [styles.side, { width: layout.sideWidth }] : styles.below]}>
              <View style={!sideways && styles.timeArea}>{time}</View>
              {controls}
            </View>
          </View>
        )}
      </TimerFace>
    </Screen>
  );

  // Number pads on iOS have no return key; tapping outside the fields closes them.
  if (Platform.OS === 'web') return content;
  return (
    <Pressable style={styles.fill} onPress={Keyboard.dismiss} accessible={false}>
      {content}
    </Pressable>
  );
}

function TopButton({ label, icon: Glyph, onPress }: { label: string; icon: LucideIcon; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [styles.topButton, pressed && { opacity: 0.6 }]}>
      <Glyph size={22} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { flex: 1 },
  // Sideways, the dial and the column sit together in the middle, with any spare width outside them.
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  dialBox: { alignSelf: 'center' },
  below: { flex: 1 },
  // Stacked, the time is centered in all the height between the dial and the buttons. A minimum
  // of 0 keeps it from pushing them aside for the moment before the dial resizes.
  timeArea: { flex: 1, minHeight: 0, justifyContent: 'center' },
  side: { alignSelf: 'stretch', justifyContent: 'center', paddingTop: TOP_BAR_HEIGHT },
  // Above the dial and column, which come after it but mustn't cover its buttons.
  corner: { position: 'absolute', top: 0, right: 0, zIndex: 1 },
  topBar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  topButton: { padding: Spacing.two },
});
