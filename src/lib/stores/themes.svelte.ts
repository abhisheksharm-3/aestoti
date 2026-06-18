import { browser } from '$app/environment';
import type { ThemeType } from '$lib/types';
import { THEMES } from '$lib/config/themes';
import { writeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_theme';

let activeThemeId = $state<string>('tomato');

function applyTheme(themeId: string): void {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme || !browser) return;
  const root = document.documentElement.style;
  // Drive the real design-system token so the whole app recolors.
  root.setProperty('--primary', theme.primaryHsl);
  root.setProperty('--ring', theme.primaryHsl);
  // Keep the legacy vars for any code still reading them.
  root.setProperty('--theme-primary', theme.primary);
  root.setProperty('--theme-secondary', theme.secondary);
  root.setProperty('--theme-accent', theme.accent);
}

export const themes = {
  get activeId() { return activeThemeId; },
  get current(): ThemeType { return THEMES.find(t => t.id === activeThemeId) ?? THEMES[0]; },

  initialize(): void {
    if (!browser) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.some(t => t.id === stored)) activeThemeId = stored;
    // Always apply so the default theme establishes the brand color on first load.
    applyTheme(activeThemeId);
  },

  setTheme(themeId: string): void {
    activeThemeId = themeId;
    applyTheme(themeId);
    writeStorage(STORAGE_KEY, themeId);
  }
};
