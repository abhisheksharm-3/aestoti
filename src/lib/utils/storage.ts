import { browser } from '$app/environment';

/** Persist a value, swallowing quota / private-mode write failures. */
export function writeStorage(key: string, value: string): void {
  if (!browser) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage full or unavailable (private mode) — non-fatal
  }
}

/** Remove a value, swallowing failures. */
export function removeStorage(key: string): void {
  if (!browser) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // non-fatal
  }
}
