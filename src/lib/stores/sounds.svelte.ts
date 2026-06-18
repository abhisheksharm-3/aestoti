import { browser } from '$app/environment';
import { SOUND_PRESETS, NOTIFICATION_SOUNDS } from '$lib/config/sounds';
import { audioEngine } from '$lib/services/audio';
import { writeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_sounds';

type SoundSettingsType = {
  ambientSoundId: string;
  ambientVolume: number;
  notificationSoundId: string;
  notificationVolume: number;
};

const DEFAULT_SETTINGS: SoundSettingsType = {
  ambientSoundId: 'none',
  ambientVolume: 50,
  notificationSoundId: 'bell',
  notificationVolume: 80
};

let current = $state<SoundSettingsType>({ ...DEFAULT_SETTINGS });
let previewing = $state(false);

function persist(): void {
  writeStorage(STORAGE_KEY, JSON.stringify(current));
}

export const sounds = {
  get current() { return current; },
  get previewing() { return previewing; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) current = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) as SoundSettingsType };
    } catch {
      current = { ...DEFAULT_SETTINGS };
    }
  },

  setAmbientSound(soundId: string): void {
    current = { ...current, ambientSoundId: soundId };
    persist();
  },

  setAmbientVolume(volume: number): void {
    current = { ...current, ambientVolume: Math.min(100, Math.max(0, volume)) };
    audioEngine.setAmbientVolume(current.ambientVolume / 100);
    persist();
  },

  setPreview(value: boolean): void {
    previewing = value;
  },

  setNotificationSound(soundId: string): void {
    current = { ...current, notificationSoundId: soundId };
    persist();
  },

  setNotificationVolume(volume: number): void {
    current = { ...current, notificationVolume: Math.min(100, Math.max(0, volume)) };
    persist();
  },

  // Single source of truth for ambient playback. `active` is the caller's full
  // intent (focus session running, or previewing, AND sound enabled). Resolves
  // the currently-selected preset and hands the audio engine what to play, so
  // callers just pass whether ambient should be audible right now.
  syncAmbient(active: boolean): void {
    const preset = SOUND_PRESETS.find((p) => p.id === current.ambientSoundId);
    if (!active || !preset || !preset.src) {
      audioEngine.stopAmbient();
      return;
    }
    audioEngine.playAmbient(preset.src, current.ambientVolume / 100);
  },

  stopAmbient(): void {
    audioEngine.stopAmbient();
  },

  playNotification(): void {
    const preset = NOTIFICATION_SOUNDS.find(p => p.id === current.notificationSoundId);
    if (!preset || !preset.src) return;
    audioEngine.playOnce(preset.src, current.notificationVolume / 100);
  }
};
