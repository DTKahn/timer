import type { SoundId } from '@/constants/sounds';

let pending: ReturnType<typeof setTimeout> | undefined;

const supported = () => typeof window !== 'undefined' && 'Notification' in window;

/** Must be called from a click handler — browsers ignore it otherwise. */
export async function requestAlertPermission(): Promise<void> {
  if (supported() && Notification.permission === 'default') await Notification.requestPermission();
}

/** Shows a system notification at `endAt` if the tab is in the background. */
export async function scheduleTimerAlert(endAt: number, body: string, _sound: SoundId): Promise<void> {
  await cancelTimerAlert();
  pending = setTimeout(() => {
    if (supported() && document.hidden && Notification.permission === 'granted') {
      new Notification('Time’s up', { body });
    }
  }, Math.max(0, endAt - Date.now()));
}

export async function cancelTimerAlert(): Promise<void> {
  clearTimeout(pending);
  pending = undefined;
}
