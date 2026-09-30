import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import { cancelTimerAlert, scheduleTimerAlert } from '@/platform/alerts';
import { playSound } from '@/platform/sounds';
import { useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';
import { formatDuration, formatShort } from '@/timer/engine';

/** How late a finish can be noticed and still count as "just now" for the chime. */
const FRESH_FINISH_MS = 3000;

/**
 * Side effects that follow the timer state: finishing on time, alerts,
 * sound, haptics, keeping the screen on, and the browser tab title.
 * Render once, after stores have hydrated.
 */
export function TimerEffects() {
  const timer = useTimer((s) => s.timer);
  const tick = useTimer((s) => s.tick);
  const { sound, haptics, keepAwake } = useSettings();
  const previousStatus = useRef(timer.status);

  // Finish exactly at the end time.
  useEffect(() => {
    if (timer.status !== 'running') return;
    const id = setTimeout(tick, Math.max(0, timer.endAt - Date.now()));
    return () => clearTimeout(id);
  }, [timer, tick]);

  // Timers are suspended in the background; catch up on return.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => state === 'active' && tick());
    return () => sub.remove();
  }, [tick]);

  // System alert for when the app isn't in the foreground.
  useEffect(() => {
    const work =
      timer.status === 'running'
        ? scheduleTimerAlert(timer.endAt, `Your ${formatShort(timer.durationMs)} timer is done.`, sound)
        : cancelTimerAlert();
    work.catch((e) => console.warn('Timer alert failed', e));
  }, [timer, sound]);

  // Sound and haptic when the timer runs out while the app is open.
  useEffect(() => {
    const was = previousStatus.current;
    previousStatus.current = timer.status;
    if (timer.status !== 'finished' || was !== 'running') return;
    if (Date.now() - timer.endedAt > FRESH_FINISH_MS) return;
    playSound(sound);
    if (haptics && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [timer, sound, haptics]);

  useEffect(() => {
    if (timer.status !== 'running' || !keepAwake) return;
    activateKeepAwakeAsync('timer').catch(() => {});
    return () => {
      deactivateKeepAwake('timer').catch(() => {});
    };
  }, [timer.status, keepAwake]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (timer.status !== 'running') {
      document.title = timer.status === 'finished' ? 'Time’s up' : 'Timer';
      return;
    }
    const update = () => (document.title = `${formatDuration(timer.endAt - Date.now())} left`);
    update();
    const id = setInterval(update, 250);
    return () => clearInterval(id);
  }, [timer]);

  return null;
}
