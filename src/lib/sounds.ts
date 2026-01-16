import { writable, get } from 'svelte/store';
import type { SoundPresetType } from './types';

const STORAGE_KEY = 'aestoti_sounds';

/**
 * Available ambient sound presets - using local files
 */
export const SOUND_PRESETS: SoundPresetType[] = [
    { id: 'none', name: 'None', icon: '🔇', src: '' },
    { id: 'clock', name: 'Clock Tick', icon: '⏰', src: '/clock-sound-tick.mp3' },
    { id: 'rain', name: 'Rain', icon: '🌧️', src: '/sounds/rain.mp3' },
    { id: 'forest', name: 'Forest', icon: '🌲', src: '/sounds/forest.mp3' },
    { id: 'ocean', name: 'Ocean Waves', icon: '🌊', src: '/sounds/ocean.mp3' },
    { id: 'fire', name: 'Fireplace', icon: '🔥', src: '/sounds/fire.mp3' }
];

/**
 * Notification sound presets - using local bell sound
 */
export const NOTIFICATION_SOUNDS: SoundPresetType[] = [
    { id: 'bell', name: 'Bell', icon: '🔔', src: '/clock-sound-tick.mp3' }
];

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

function loadSettings(): SoundSettingsType {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
}

function createSoundsStore() {
    const { subscribe, set, update } = writable<SoundSettingsType>(DEFAULT_SETTINGS);

    let ambientAudio: HTMLAudioElement | null = null;

    return {
        subscribe,

        initialize(): void {
            set(loadSettings());
        },

        setAmbientSound(soundId: string): void {
            update(s => {
                const updated = { ...s, ambientSoundId: soundId };
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                }
                return updated;
            });
        },

        setAmbientVolume(volume: number): void {
            update(s => {
                const updated = { ...s, ambientVolume: Math.min(100, Math.max(0, volume)) };
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                }
                if (ambientAudio) {
                    ambientAudio.volume = updated.ambientVolume / 100;
                }
                return updated;
            });
        },

        setNotificationSound(soundId: string): void {
            update(s => {
                const updated = { ...s, notificationSoundId: soundId };
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                }
                return updated;
            });
        },

        setNotificationVolume(volume: number): void {
            update(s => {
                const updated = { ...s, notificationVolume: Math.min(100, Math.max(0, volume)) };
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                }
                return updated;
            });
        },

        playAmbient(): void {
            const current = get({ subscribe });
            const preset = SOUND_PRESETS.find(p => p.id === current.ambientSoundId);

            if (!preset || !preset.src) {
                this.stopAmbient();
                return;
            }

            if (typeof window === 'undefined') return;

            if (!ambientAudio) {
                ambientAudio = new Audio();
                ambientAudio.loop = true;
            }

            // Create absolute URL for comparison
            const fullSrc = new URL(preset.src, window.location.href).href;

            // Only update src if it's different (prevents restarting)
            if (ambientAudio.src !== fullSrc) {
                ambientAudio.src = fullSrc;
                // Only call play if we changed source or if it was paused
                ambientAudio.volume = current.ambientVolume / 100;
                ambientAudio.play().catch(() => { });
            } else if (ambientAudio.paused) {
                ambientAudio.volume = current.ambientVolume / 100;
                ambientAudio.play().catch(() => { });
            } else {
                // Just update volume if already playing
                ambientAudio.volume = current.ambientVolume / 100;
            }
        },

        stopAmbient(): void {
            if (ambientAudio) {
                ambientAudio.pause();
                ambientAudio.currentTime = 0;
            }
        },

        playNotification(): void {
            const current = get({ subscribe });
            const preset = NOTIFICATION_SOUNDS.find(p => p.id === current.notificationSoundId);

            if (!preset || !preset.src || typeof window === 'undefined') return;

            const audio = new Audio(preset.src);
            audio.volume = current.notificationVolume / 100;
            audio.play().catch(() => { });
        }
    };
}

export const sounds = createSoundsStore();
