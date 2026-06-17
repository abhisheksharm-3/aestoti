import { browser } from '$app/environment';
import type { ThemeType } from '$lib/types';
import { writeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_theme';

// `primaryHsl` is the shadcn `--primary` token ("H S% L%"), so picking a theme
// recolors the ENTIRE UI (buttons, switch, progress ring, active states) — not
// just the few inline-styled timer buttons. `primary`/`accent` hex remain for
// the swatch preview and the legacy `--theme-*` vars.
export const THEMES: ThemeType[] = [
  { id: 'tomato', name: 'Tomato', primary: '#C4411F', secondary: '#471515', accent: '#E0633B', primaryHsl: '13 74% 44%' },
  { id: 'ocean', name: 'Ocean', primary: '#0EA5E9', secondary: '#0C4A6E', accent: '#38BDF8', primaryHsl: '199 89% 48%' },
  { id: 'forest', name: 'Forest', primary: '#22C55E', secondary: '#14532D', accent: '#4ADE80', primaryHsl: '142 71% 45%' },
  { id: 'sunset', name: 'Sunset', primary: '#F97316', secondary: '#7C2D12', accent: '#FB923C', primaryHsl: '25 95% 53%' },
  { id: 'purple', name: 'Purple', primary: '#A855F7', secondary: '#581C87', accent: '#C084FC', primaryHsl: '271 91% 65%' },
  { id: 'rose', name: 'Rose', primary: '#F43F5E', secondary: '#881337', accent: '#FB7185', primaryHsl: '350 89% 60%' }
];

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
    if (stored) activeThemeId = stored;
    // Always apply so the default theme establishes the brand color on first load.
    applyTheme(activeThemeId);
  },

  setTheme(themeId: string): void {
    activeThemeId = themeId;
    applyTheme(themeId);
    writeStorage(STORAGE_KEY, themeId);
  }
};
