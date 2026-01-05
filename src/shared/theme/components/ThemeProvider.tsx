import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { ThemeContext } from '../hooks/useTheme';
import type { Theme, ResolvedTheme } from '../types';
import { THEME_STORAGE_KEY } from '../types';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return null;
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyThemeToDOM(resolved: ResolvedTheme) {
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return getStoredTheme() ?? defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    return resolveTheme(getStoredTheme() ?? defaultTheme);
  });

  // Update resolved theme and DOM when theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyThemeToDOM(resolved);
  }, [theme]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
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

  // Apply theme on initial mount
  useEffect(() => {
    const resolved = resolveTheme(theme);
    applyThemeToDOM(resolved);
  }, []);

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
