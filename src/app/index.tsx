import { router } from 'expo-router';
import { History, Settings, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DurationChips } from '@/components/duration-chips';
import { Screen } from '@/components/screen';
import { CONTROLS_HEIGHT, TimerControls } from '@/components/timer-controls';
import { EXTRAS_HEIGHT, READOUT_HEIGHT, TimerFace } from '@/components/timer-face';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFavorites } from '@/store/favorites';
import { useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';

const TOP_BAR_HEIGHT = 48;
/** Smallest gap between the four sections; any spare height is shared evenly between them. */
const MIN_GAP = Spacing.four;
const TIME_SECTION_HEIGHT = READOUT_HEIGHT + Spacing.two + EXTRAS_HEIGHT;
// Everything stacked with the dial except the controls: top bar, time section, gaps, bottom padding.
const AROUND_DIAL = TOP_BAR_HEIGHT + TIME_SECTION_HEIGHT + MIN_GAP * 3 + Spacing.four;

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const favorites = useFavorites((s) => s.favorites);
  const color = useSettings((s) => s.color);
  const timer = useTimer((s) => s.timer);
  const setDuration = useTimer((s) => s.setDuration);
  const [draftEmpty, setDraftEmpty] = useState(false);

  const available = height - insets.top - insets.bottom - AROUND_DIAL - CONTROLS_HEIGHT;
  const dial = Math.max(160, Math.min(width - Spacing.four * 2, available, 460));

  const content = (
    <Screen style={styles.screen}>
      <View style={styles.topBar}>
        <TopButton label="History" icon={History} onPress={() => router.push('/history')} />
        <TopButton label="Settings" icon={Settings} onPress={() => router.push('/settings')} />
      </View>
      <TimerFace
        size={dial}
        onDraftEmptyChange={setDraftEmpty}
        editingExtras={
          <DurationChips
            durations={favorites.map((f) => f.durationMs)}
            selected={timer.durationMs}
            color={color}
            onSelect={setDuration}
          />
        }
      />
      <TimerControls canStart={!draftEmpty} />
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
  // Header, dial, time, and buttons with equal space between each.
  screen: { justifyContent: 'space-between', paddingBottom: Spacing.four },
  topBar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  topButton: { padding: Spacing.two },
});
