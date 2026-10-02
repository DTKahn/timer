import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

import type { SoundId } from '@/constants/sounds';

const SOURCES: Record<Exclude<SoundId, 'silent'>, number> = {
  bell: require('@/assets/sounds/bell.wav'),
  bird: require('@/assets/sounds/bird.wav'),
  guitar: require('@/assets/sounds/guitar.wav'),
};

const players = new Map<SoundId, AudioPlayer>();
let audioModeSet = false;

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
  if (Platform.OS === 'web' && !player.playing) {
    player.muted = true;
    player.play();
  }
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
