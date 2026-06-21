import type { ThemeType } from '$lib/types';

/**
 * `primaryHsl` is the shadcn `--primary` token ("H S% L%"), so picking a theme
 * recolors the entire UI — buttons, switch, progress ring, active states — not
 * just the inline-styled timer buttons. `primary` hex drives the swatch preview
 * in the theme picker.
 */
export const THEMES: ThemeType[] = [
  { id: 'tomato', name: 'Tomato', primary: '#C4411F', primaryHsl: '13 74% 44%' },
  { id: 'ocean', name: 'Ocean', primary: '#0EA5E9', primaryHsl: '199 89% 48%' },
  { id: 'forest', name: 'Forest', primary: '#22C55E', primaryHsl: '142 71% 45%' },
  { id: 'sunset', name: 'Sunset', primary: '#F97316', primaryHsl: '25 95% 53%' },
  { id: 'purple', name: 'Purple', primary: '#A855F7', primaryHsl: '271 91% 65%' },
  { id: 'rose', name: 'Rose', primary: '#F43F5E', primaryHsl: '350 89% 60%' }
];
