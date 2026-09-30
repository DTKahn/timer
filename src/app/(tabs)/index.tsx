import { useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DurationChips } from '@/components/duration-chips';
import { Screen } from '@/components/screen';
import { TimerControls } from '@/components/timer-controls';
import { EXTRAS_HEIGHT, READOUT_HEIGHT, TimerFace } from '@/components/timer-face';
import { BottomTabInset, Spacing, TopBarInset } from '@/constants/theme';
import { useFavorites } from '@/store/favorites';
import { useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';

// Everything stacked under the dial: readout, favorites, controls, gaps.
const BELOW_DIAL = READOUT_HEIGHT + EXTRAS_HEIGHT + 80 + Spacing.two * 2 + Spacing.four * 2;

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const favorites = useFavorites((s) => s.favorites);
  const color = useSettings((s) => s.color);
  const timer = useTimer((s) => s.timer);
  const setDuration = useTimer((s) => s.setDuration);
  const [draftEmpty, setDraftEmpty] = useState(false);

  const available = height - insets.top - insets.bottom - TopBarInset - BottomTabInset - BELOW_DIAL;
  const dial = Math.max(160, Math.min(width - Spacing.four * 2, available, 460));

  const content = (
    <Screen style={styles.screen}>
      <View style={styles.center}>
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
      </View>
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

const styles = StyleSheet.create({
  fill: { flex: 1 },
  screen: { justifyContent: 'space-between', paddingBottom: Spacing.four },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.four },
});
