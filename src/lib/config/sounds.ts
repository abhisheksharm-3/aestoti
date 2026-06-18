import type { SoundPresetType } from '$lib/types';

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
