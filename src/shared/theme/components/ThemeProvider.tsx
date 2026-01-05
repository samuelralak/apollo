import { useState, useCallback, type ReactNode } from 'react';
import { useMountEffect, useUpdateEffect } from '@react-hookz/web';
import { ThemeContext } from '../hooks/useTheme';
import type { Theme, ResolvedTheme } from '../types';
import { THEME_STORAGE_KEY } from '../types';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

const getSystemTheme = (): ResolvedTheme =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : null;
};

const resolveTheme = (theme: Theme): ResolvedTheme =>
  theme === 'system' ? getSystemTheme() : theme;

const applyThemeToDOM = (resolved: ResolvedTheme) => {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme() ?? defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(getStoredTheme() ?? defaultTheme));

  // Apply theme on initial mount
  useMountEffect(() => {
    applyThemeToDOM(resolveTheme(theme));
  });

  // Update resolved theme and DOM when theme changes
  useUpdateEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyThemeToDOM(resolved);
  }, [theme]);

  // Listen for system theme changes when in 'system' mode
  useUpdateEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyThemeToDOM(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    // Update state
    setThemeState(newTheme);

    // Immediately apply to DOM (don't wait for effect)
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyThemeToDOM(resolved);

    // Persist to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
