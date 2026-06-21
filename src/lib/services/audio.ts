import { browser } from '$app/environment';

let ambientEl: HTMLAudioElement | null = null;
let ambientErrorHandler: (() => void) | null = null;

/**
 * Owns the `HTMLAudioElement` lifecycle for ambient playback and one-shot cues.
 * The sounds store holds which sound and volume; this service is the only code
 * that touches the DOM audio API, keeping playback mechanics out of the store.
 */
export const audioEngine = {
  /** Register a callback fired when ambient playback errors (e.g. a dead stream). */
  onAmbientError(cb: () => void): void {
    ambientErrorHandler = cb;
  },

  /** Play (or reconcile) the looping ambient track at `volume` (0–1). */
  playAmbient(src: string, volume: number): void {
    if (!browser) return;
    if (!ambientEl) {
      ambientEl = new Audio();
      ambientEl.loop = true;
      ambientEl.addEventListener('error', () => ambientErrorHandler?.());
    }
    ambientEl.volume = volume;
    const fullSrc = new URL(src, window.location.href).href;
    if (ambientEl.src !== fullSrc) {
      ambientEl.src = fullSrc;
      ambientEl.play().catch(() => {});
    } else if (ambientEl.paused) {
      ambientEl.play().catch(() => {});
    }
  },

  setAmbientVolume(volume: number): void {
    if (ambientEl) ambientEl.volume = volume;
  },

  stopAmbient(): void {
    if (ambientEl) {
      ambientEl.pause();
      ambientEl.currentTime = 0;
    }
  },

  /** Fire-and-forget one-shot cue (e.g. the timer-complete chime). */
  playOnce(src: string, volume: number): void {
    if (!browser) return;
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  }
};
