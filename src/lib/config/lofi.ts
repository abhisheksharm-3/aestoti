import type { SoundPresetType } from '$lib/types';

/**
 * Live focus/chill internet radio from SomaFM (commercial-free, listener-supported).
 * `ice.somafm.com` is the load-balanced host, and streams must be HTTPS to
 * satisfy the app's CSP. Swap channels or provider by editing this list.
 */
export const LOFI_STATIONS: SoundPresetType[] = [
  { id: 'lofi-fluid', name: 'Lofi', icon: '🎧', src: 'https://ice.somafm.com/fluid-128-mp3' },
  { id: 'lofi-groovesalad', name: 'Chill', icon: '🛋️', src: 'https://ice.somafm.com/groovesalad-128-mp3' },
  { id: 'lofi-sonicuniverse', name: 'Jazz', icon: '🎷', src: 'https://ice.somafm.com/sonicuniverse-128-mp3' },
  { id: 'lofi-beatblender', name: 'House', icon: '🪩', src: 'https://ice.somafm.com/beatblender-128-mp3' },
  { id: 'lofi-lush', name: 'Mellow', icon: '🌸', src: 'https://ice.somafm.com/lush-128-mp3' },
  { id: 'lofi-spacestation', name: 'Space', icon: '🛰️', src: 'https://ice.somafm.com/spacestation-128-mp3' },
  { id: 'lofi-dronezone', name: 'Sleep', icon: '🌙', src: 'https://ice.somafm.com/dronezone-128-mp3' },
  { id: 'lofi-vaporwaves', name: 'Vaporwave', icon: '📼', src: 'https://ice.somafm.com/vaporwaves-128-mp3' }
];
