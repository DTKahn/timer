import * as Notifications from 'expo-notifications';

import type { SoundId } from '@/constants/sounds';

// In the foreground the app plays its own sound, so only log to Notification Center.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestAlertPermission(): Promise<void> {
  const current = await Notifications.getPermissionsAsync();
  if (!current.granted && current.canAskAgain) await Notifications.requestPermissionsAsync();
}

/** Schedules the "time's up" alert so it fires even if the app is closed. */
export async function scheduleTimerAlert(endAt: number, body: string, sound: SoundId): Promise<void> {
  // The app only ever has one pending alert, so clearing everything is safe
  // and survives app restarts (no identifier to lose).
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    // Bundled into the iOS app by the expo-notifications plugin (see app.json).
    content: { title: 'Time’s up', body, sound: sound === 'silent' ? false : `${sound}.wav` },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: endAt },
  });
}

export async function cancelTimerAlert(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
