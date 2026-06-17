import { browser } from '$app/environment';
import type { SoundPresetType } from '$lib/types';
import { writeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_sounds';

type SoundSettingsType = {
  ambientSoundId: string;
  ambientVolume: number;
  notificationSoundId: string;
  notificationVolume: number;
};

export const SOUND_PRESETS: SoundPresetType[] = [
  { id: 'none', name: 'None', icon: '🔇', src: '' },
  { id: 'clock', name: 'Clock Tick', icon: '⏰', src: '/clock-sound-tick.mp3' },
  { id: 'rain', name: 'Rain', icon: '🌧️', src: '/sounds/rain.mp3' },
  { id: 'forest', name: 'Forest', icon: '🌲', src: '/sounds/forest.mp3' },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', src: '/sounds/ocean.mp3' },
  { id: 'fire', name: 'Fireplace', icon: '🔥', src: '/sounds/fire.mp3' }
];

export const NOTIFICATION_SOUNDS: SoundPresetType[] = [
  { id: 'bell', name: 'Bell', icon: '🔔', src: '/clock-sound-tick.mp3' }
];

const DEFAULT_SETTINGS: SoundSettingsType = {
  ambientSoundId: 'none',
  ambientVolume: 50,
  notificationSoundId: 'bell',
  notificationVolume: 80
};

let current = $state<SoundSettingsType>({ ...DEFAULT_SETTINGS });
let previewing = $state(false);
let ambientAudio: HTMLAudioElement | null = null;

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
    if (ambientAudio) ambientAudio.volume = current.ambientVolume / 100;
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
  // intent (focus session running, or previewing, AND sound enabled). It reads
  // the currently-selected sound + volume, so callers just pass whether ambient
  // should be audible right now and this reconciles the <audio> element.
  syncAmbient(active: boolean): void {
    if (!browser) return;
    const preset = SOUND_PRESETS.find((p) => p.id === current.ambientSoundId);
    if (!active || !preset || !preset.src) {
      this.stopAmbient();
      return;
    }
    if (!ambientAudio) {
      ambientAudio = new Audio();
      ambientAudio.loop = true;
    }
    ambientAudio.volume = current.ambientVolume / 100;
    const fullSrc = new URL(preset.src, window.location.href).href;
    if (ambientAudio.src !== fullSrc) {
      ambientAudio.src = fullSrc;
      ambientAudio.play().catch(() => {});
    } else if (ambientAudio.paused) {
      ambientAudio.play().catch(() => {});
    }
  },

  stopAmbient(): void {
    if (ambientAudio) {
      ambientAudio.pause();
      ambientAudio.currentTime = 0;
    }
  },

  playNotification(): void {
    if (!browser) return;
    const preset = NOTIFICATION_SOUNDS.find(p => p.id === current.notificationSoundId);
    if (!preset || !preset.src) return;
    const audio = new Audio(preset.src);
    audio.volume = current.notificationVolume / 100;
    audio.play().catch(() => {});
  }
};
