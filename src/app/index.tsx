import { router } from 'expo-router';
import { History, Settings, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoritesSection } from '@/components/favorites-section';
import { ScaledView } from '@/components/scaled-view';
import { Screen } from '@/components/screen';
import { CONTROLS_HEIGHT, TimerControls } from '@/components/timer-controls';
import { EXTRAS_HEIGHT, READOUT_HEIGHT, TimerFace } from '@/components/timer-face';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';

const TOP_BAR_HEIGHT = 48;
/** Smallest gap between the dial, time, favorites, and buttons; any spare height is shared evenly between them. */
const MIN_GAP = Spacing.four;
// Everything stacked with the dial except the controls: top bar, time, favorites, gaps, bottom padding.
const AROUND_DIAL = TOP_BAR_HEIGHT + READOUT_HEIGHT + EXTRAS_HEIGHT + MIN_GAP * 3 + Spacing.four;
/** Landscape phones are shorter than this; taller windows (tablets, desktops) keep the stacked layout. */
const LANDSCAPE_MAX_HEIGHT = 600;
/** Narrowest the time and buttons fit, stacked or in the column beside the dial. */
const SIDE_MIN_WIDTH = 340;
const DIAL_MARGIN = Spacing.three;
const MIN_DIAL = 160;
const MAX_DIAL = 460;
/** Smallest window area each layout fits at full size; smaller ones shrink everything evenly. */
const STACKED_MIN_HEIGHT = AROUND_DIAL + CONTROLS_HEIGHT + MIN_DIAL;
const LANDSCAPE_MIN_WIDTH = MIN_DIAL + DIAL_MARGIN * 2 + SIDE_MIN_WIDTH;
const LANDSCAPE_MIN_HEIGHT = TOP_BAR_HEIGHT + READOUT_HEIGHT + EXTRAS_HEIGHT + CONTROLS_HEIGHT + Spacing.three;

/**
 * Stacked layout for an area of this size: how much to shrink it (1 when it
 * fits) and the dial size before shrinking.
 */
function stackedLayout(width: number, height: number) {
  const scale = Math.min(1, width / SIDE_MIN_WIDTH, height / STACKED_MIN_HEIGHT);
  const w = width / scale;
  const h = height / scale;
  const dial = Math.max(MIN_DIAL, Math.min(w - Spacing.four * 2, h - AROUND_DIAL - CONTROLS_HEIGHT, MAX_DIAL));
  return { scale, dial };
}

/** Side-by-side layout; `uprightDial` is how big the dial shows on screen with the phone upright. */
function landscapeLayout(width: number, height: number, uprightDial: number) {
  const scale = Math.min(1, width / LANDSCAPE_MIN_WIDTH, height / LANDSCAPE_MIN_HEIGHT);
  const w = width / scale;
  const h = height / scale;
  const dial = Math.max(
    MIN_DIAL,
    Math.min(uprightDial / scale, h - DIAL_MARGIN * 2, w - SIDE_MIN_WIDTH - DIAL_MARGIN * 2),
  );
  return { scale, dial };
}

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const color = useSettings((s) => s.color);
  const timer = useTimer((s) => s.timer);
  const setDuration = useTimer((s) => s.setDuration);
  const [draftEmpty, setDraftEmpty] = useState(false);

  // The area inside the safe insets, capped like the screen's content.
  const areaWidth = Math.min(width - insets.left - insets.right, MaxContentWidth);
  const areaHeight = height - insets.top - insets.bottom;

  // A phone on its side: the dial goes on the left, the same size as when upright.
  const landscape = width > height && height < LANDSCAPE_MAX_HEIGHT;
  let layout;
  if (landscape) {
    // Upright, the notch side becomes the top and the home indicator stays at the bottom.
    const upright = stackedLayout(
      Math.min(height, MaxContentWidth),
      width - Math.max(insets.left, insets.right) - insets.bottom,
    );
    layout = landscapeLayout(areaWidth, areaHeight, upright.dial * upright.scale);
  } else {
    layout = stackedLayout(areaWidth, areaHeight);
  }
  const { scale, dial } = layout;

  const topBar = (
    <View style={styles.topBar}>
      <TopButton label="History" icon={History} onPress={() => router.push('/history')} />
      <TopButton label="Settings" icon={Settings} onPress={() => router.push('/settings')} />
    </View>
  );
  const favorites = (
    <FavoritesSection durationMs={timer.durationMs} color={color} disabled={draftEmpty} onSelect={setDuration} />
  );
  const controls = <TimerControls canStart={!draftEmpty} />;

  const content = landscape ? (
    <Screen>
      <ScaledView scale={scale} width={areaWidth} height={areaHeight} style={styles.landscape}>
        <TimerFace size={dial} onDraftEmptyChange={setDraftEmpty} editingExtras={favorites}>
          {({ dial: dialView, readout, extras }) => (
            <>
              <View style={styles.dialColumn}>{dialView}</View>
              <View style={styles.side}>
                {topBar}
                <View style={styles.sections}>
                  {readout}
                  {extras}
                  {controls}
                </View>
              </View>
            </>
          )}
        </TimerFace>
      </ScaledView>
    </Screen>
  ) : (
    <Screen>
      <ScaledView scale={scale} width={areaWidth} height={areaHeight} style={styles.screen}>
        {topBar}
        <View style={styles.sections}>
          <TimerFace size={dial} onDraftEmptyChange={setDraftEmpty} editingExtras={favorites} />
          {controls}
        </View>
      </ScaledView>
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
  screen: { paddingBottom: Spacing.four },
  landscape: { flexDirection: 'row', paddingBottom: Spacing.three },
  dialColumn: { justifyContent: 'center', paddingHorizontal: DIAL_MARGIN },
  side: { flex: 1 },
  // The dial sits right under the top bar; the dial, time, favorites, and buttons share the spare height evenly.
  sections: { flex: 1, justifyContent: 'space-between' },
  topBar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  topButton: { padding: Spacing.two },
});
