import { browser } from '$app/environment';
import { toast } from 'svelte-sonner';
import { SOUND_PRESETS, NOTIFICATION_SOUNDS } from '$lib/config/sounds';
import { LOFI_STATIONS } from '$lib/config/lofi';
import { audioEngine } from '$lib/services/audio';
import { writeStorage } from '$lib/utils/storage';
import type { SoundPresetType, SoundSettingsType } from '$lib/types';

const STORAGE_KEY = 'aestoti_sounds';

/** Resolve an ambient id to its preset — a built-in sound or a lofi station. */
function findSource(id: string): SoundPresetType | undefined {
  return SOUND_PRESETS.find(p => p.id === id) ?? LOFI_STATIONS.find(p => p.id === id);
}

const DEFAULT_SETTINGS: SoundSettingsType = {
  ambientSoundId: 'none',
  ambientVolume: 50,
  notificationSoundId: 'bell',
  notificationVolume: 80
};

let current = $state<SoundSettingsType>({ ...DEFAULT_SETTINGS });
let isPreviewing = $state(false);

function persist(): void {
  writeStorage(STORAGE_KEY, JSON.stringify(current));
}

function clampVolume(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback;
}

/** Merge persisted sound settings over defaults, clamping volumes and rejecting non-string ids. */
export function sanitizeSounds(raw: Partial<SoundSettingsType>): SoundSettingsType {
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
  get isPreviewing() { return isPreviewing; },

  /**
   * Hydrate sound settings from storage and register the ambient error handler.
   * Only lofi stations surface an error toast (a failed stream means offline or
   * a down station); bundled ambient files essentially never error.
   */
  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) current = sanitizeSounds(JSON.parse(stored) as Partial<SoundSettingsType>);
    } catch {
      current = { ...DEFAULT_SETTINGS };
    }
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
    if (soundId === 'none') isPreviewing = false;
    persist();
  },

  setAmbientVolume(volume: number): void {
    current = { ...current, ambientVolume: Math.min(100, Math.max(0, volume)) };
    audioEngine.setAmbientVolume(current.ambientVolume / 100);
    persist();
  },

  setPreview(value: boolean): void {
    isPreviewing = value;
  },

  /**
   * Single source of truth for ambient playback. `active` is the caller's full
   * intent (a focus session running or a preview, with sound enabled); this
   * resolves the selected preset and tells the audio engine what to play.
   */
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
