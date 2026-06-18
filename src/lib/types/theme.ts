export type ThemeType = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  /** shadcn `--primary` token value ("H S% L%") so the whole UI recolors. */
  primaryHsl: string;
};
