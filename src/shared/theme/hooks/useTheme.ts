import { createContext, useContext } from 'react';
import type { ThemeContextValue } from '../types';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Hook to access theme context
 * Must be used within a ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
