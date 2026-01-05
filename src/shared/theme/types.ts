/**
 * Theme type definitions
 */

export type Theme = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  /** Current theme setting (includes 'system' option) */
  theme: Theme;
  /** Resolved theme (actual light/dark value) */
  resolvedTheme: ResolvedTheme;
  /** Update the theme */
  setTheme: (theme: Theme) => void;
}

export const THEME_STORAGE_KEY = 'apollo-theme';
