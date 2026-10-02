import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

import type { SoundId } from '@/constants/sounds';

const SOURCES: Record<Exclude<SoundId, 'silent'>, number> = {
  bell: require('@/assets/sounds/bell.wav'),
  bird: require('@/assets/sounds/bird.wav'),
  guitar: require('@/assets/sounds/guitar.wav'),
  watch: require('@/assets/sounds/watch.wav'),
};

const players = new Map<SoundId, AudioPlayer>();
let audioModeSet = false;
let lastPrepared: SoundId | undefined;
let watchingReturn = false;

function getPlayer(id: Exclude<SoundId, 'silent'>): AudioPlayer {
  if (!audioModeSet) {
    // Like the Clock app, a finished timer should be heard even on silent.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    audioModeSet = true;
  }
  let player = players.get(id);
  if (!player) {
    player = createAudioPlayer(SOURCES[id]);
    players.set(id, player);
  }
  return player;
}

/**
 * Gets a sound ready to play later, without a tap. Call from the tap that
 * starts a timer: browsers only allow audio that first played during a user
 * gesture, and native needs the player loaded and the audio mode applied.
 */
export function prepareSound(id: SoundId) {
  if (id === 'silent') return;
  const player = getPlayer(id);
  if (Platform.OS !== 'web') return;
  lastPrepared = id;
  watchForReturn();
  if (!player.playing) {
    player.muted = true;
    player.play();
  }
}

/**
 * iOS home screen web apps can forget that a tap allowed audio once they've
 * been in the background, so the finish sound would be blocked. Ready it
 * again when the app comes back, and on the next tap after that.
 */
function watchForReturn() {
  if (watchingReturn) return;
  watchingReturn = true;
  const gestures = ['touchend', 'click', 'keydown'] as const;
  const onGesture = () => {
    for (const g of gestures) document.removeEventListener(g, onGesture, true);
    if (lastPrepared) prepareSound(lastPrepared);
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !lastPrepared) return;
    prepareSound(lastPrepared);
    for (const g of gestures) document.addEventListener(g, onGesture, true);
  });
}

/** Plays a completion sound from the start, stopping any other one. */
export function playSound(id: SoundId) {
  stopSounds();
  if (id === 'silent') return;
  const player = getPlayer(id);
  player.muted = false;
  player.seekTo(0).catch(() => {});
  player.play();
}

export function stopSounds() {
  for (const p of players.values()) p.pause();
}
