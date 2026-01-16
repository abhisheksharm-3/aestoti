import { writable, get } from 'svelte/store';
import type { ThemeType } from './types';

const STORAGE_KEY = 'aestoti_theme';

/**
 * Available themes
 */
export const THEMES: ThemeType[] = [
    { id: 'tomato', name: 'Tomato', primary: '#FF4C4C', secondary: '#471515', accent: '#FF6B6B' },
    { id: 'ocean', name: 'Ocean', primary: '#0EA5E9', secondary: '#0C4A6E', accent: '#38BDF8' },
    { id: 'forest', name: 'Forest', primary: '#22C55E', secondary: '#14532D', accent: '#4ADE80' },
    { id: 'sunset', name: 'Sunset', primary: '#F97316', secondary: '#7C2D12', accent: '#FB923C' },
    { id: 'purple', name: 'Purple', primary: '#A855F7', secondary: '#581C87', accent: '#C084FC' },
    { id: 'rose', name: 'Rose', primary: '#F43F5E', secondary: '#881337', accent: '#FB7185' }
];

/**
 * Creates the themes store
 */
function createThemesStore() {
    const { subscribe, set } = writable<string>('tomato');

    return {
        subscribe,

        /**
         * Initializes store from localStorage
         */
        initialize(): void {
            if (typeof window === 'undefined') return;
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                set(stored);
                this.apply(stored);
            }
        },

        /**
         * Sets the active theme
         */
        setTheme(themeId: string): void {
            set(themeId);
            this.apply(themeId);
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, themeId);
            }
        },

        /**
         * Applies theme CSS variables
         */
        apply(themeId: string): void {
            if (typeof window === 'undefined') return;

            const theme = THEMES.find(t => t.id === themeId);
            if (!theme) return;

            const root = document.documentElement;
            root.style.setProperty('--theme-primary', theme.primary);
            root.style.setProperty('--theme-secondary', theme.secondary);
            root.style.setProperty('--theme-accent', theme.accent);
        },

        /**
         * Gets current theme
         */
        getCurrent(): ThemeType {
            const id = get({ subscribe });
            return THEMES.find(t => t.id === id) || THEMES[0];
        }
    };
}

export const themes = createThemesStore();
