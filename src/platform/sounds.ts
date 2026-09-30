import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import type { SoundId } from '@/constants/sounds';

const SOURCES: Record<Exclude<SoundId, 'silent'>, number> = {
  bell: require('@/assets/sounds/bell.wav'),
  bird: require('@/assets/sounds/bird.wav'),
  guitar: require('@/assets/sounds/guitar.wav'),
};

const players = new Map<SoundId, AudioPlayer>();
let audioModeSet = false;

/** Plays a completion sound from the start, stopping any other one. */
export function playSound(id: SoundId) {
  stopSounds();
  if (id === 'silent') return;
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
  player.seekTo(0).catch(() => {});
  player.play();
}

export function stopSounds() {
  for (const p of players.values()) p.pause();
}
