import { browser } from '$app/environment';
import type { ThemeType } from '$lib/types';
import { THEMES } from '$lib/config/themes';
import { writeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_theme';

let activeThemeId = $state<string>('tomato');

/** Apply a theme's color to the shadcn `--primary`/`--ring` tokens so the whole app recolors. */
function applyTheme(themeId: string): void {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme || !browser) return;
  const root = document.documentElement.style;
  root.setProperty('--primary', theme.primaryHsl);
  root.setProperty('--ring', theme.primaryHsl);
}

export const themes = {
  get activeId() { return activeThemeId; },
  get current(): ThemeType { return THEMES.find(t => t.id === activeThemeId) ?? THEMES[0]; },

  /** Load the saved theme and apply it; always applies so the default establishes the brand color on first load. */
  initialize(): void {
    if (!browser) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.some(t => t.id === stored)) activeThemeId = stored;
    applyTheme(activeThemeId);
  },

  setTheme(themeId: string): void {
    activeThemeId = themeId;
    applyTheme(themeId);
    writeStorage(STORAGE_KEY, themeId);
  }
};
