export type ThemeType = {
  id: string;
  name: string;
  /** Hex swatch shown in the theme picker. */
  primary: string;
  /** shadcn `--primary` token value ("H S% L%") so the whole UI recolors. */
  primaryHsl: string;
};
