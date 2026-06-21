import { browser } from '$app/environment';
import { toast } from 'svelte-sonner';
import { SOUND_PRESETS, NOTIFICATION_SOUNDS } from '$lib/config/sounds';
import { LOFI_STATIONS } from '$lib/config/lofi';
import { audioEngine } from '$lib/services/audio';
import { writeStorage } from '$lib/utils/storage';
import type { SoundPresetType } from '$lib/types';

const STORAGE_KEY = 'aestoti_sounds';

/** Resolve an ambient id to its preset — a built-in sound or a lofi station. */
function findSource(id: string): SoundPresetType | undefined {
  return SOUND_PRESETS.find(p => p.id === id) ?? LOFI_STATIONS.find(p => p.id === id);
}

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

function clampVolume(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback;
}

/** Merge persisted sound settings over defaults, clamping volumes and rejecting non-string ids. */
function sanitizeSounds(raw: Partial<SoundSettingsType>): SoundSettingsType {
  return {
    ambientSoundId: typeof raw.ambientSoundId === 'string' ? raw.ambientSoundId : DEFAULT_SETTINGS.ambientSoundId,
    ambientVolume: clampVolume(raw.ambientVolume, DEFAULT_SETTINGS.ambientVolume),
    notificationSoundId:
      typeof raw.notificationSoundId === 'string' ? raw.notificationSoundId : DEFAULT_SETTINGS.notificationSoundId,
    notificationVolume: clampVolume(raw.notificationVolume, DEFAULT_SETTINGS.notificationVolume)
  };
}

export const sounds = {
  get current() { return current; },
  get previewing() { return previewing; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) current = sanitizeSounds(JSON.parse(stored) as Partial<SoundSettingsType>);
    } catch {
      current = { ...DEFAULT_SETTINGS };
    }
    // A failed lofi stream (offline / station down) gets surfaced; local
    // ambient files essentially never error so we only warn for stations.
    audioEngine.onAmbientError(() => {
      const station = LOFI_STATIONS.find(s => s.id === current.ambientSoundId);
      if (station) {
        toast.error('Radio unavailable', {
          description: `Couldn't reach ${station.name}. Check your connection.`
        });
      }
    });
  },

  /** Select an ambient sound; choosing "none" also ends any active preview. */
  selectAmbient(soundId: string): void {
    current = { ...current, ambientSoundId: soundId };
    if (soundId === 'none') previewing = false;
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
    const source = findSource(current.ambientSoundId);
    if (!active || !source || !source.src) {
      audioEngine.stopAmbient();
      return;
    }
    audioEngine.playAmbient(source.src, current.ambientVolume / 100);
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
