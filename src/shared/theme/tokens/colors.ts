/**
 * Color Token Definitions
 *
 * TypeScript reference for the color system.
 * The actual values are defined in css/variables.css as CSS custom properties.
 *
 * Use this file for:
 * - Documentation of available colors
 * - Type-safe color references in TypeScript
 * - Generating color previews in Storybook (if used)
 */

export const colors = {
  /** Background colors */
  background: {
    primary: 'var(--color-bg-primary)',
    secondary: 'var(--color-bg-secondary)',
    tertiary: 'var(--color-bg-tertiary)',
    elevated: 'var(--color-bg-elevated)',
    hover: 'var(--color-bg-hover)',
    active: 'var(--color-bg-active)',
  },

  /** Text/foreground colors */
  foreground: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    muted: 'var(--color-text-muted)',
    disabled: 'var(--color-text-disabled)',
    inverse: 'var(--color-text-inverse)',
  },

  /** Border colors */
  border: {
    default: 'var(--color-border-default)',
    strong: 'var(--color-border-strong)',
    focus: 'var(--color-border-focus)',
  },

  /** Primary brand color (Teal) */
  primary: {
    DEFAULT: 'var(--color-primary)',
    hover: 'var(--color-primary-hover)',
    active: 'var(--color-primary-active)',
    light: 'var(--color-primary-light)',
    bg: 'var(--color-primary-bg)',
  },

  /** Feedback colors */
  success: {
    DEFAULT: 'var(--color-success)',
    bg: 'var(--color-success-bg)',
  },
  warning: {
    DEFAULT: 'var(--color-warning)',
    bg: 'var(--color-warning-bg)',
  },
  error: {
    DEFAULT: 'var(--color-error)',
    bg: 'var(--color-error-bg)',
  },
  info: {
    DEFAULT: 'var(--color-info)',
    bg: 'var(--color-info-bg)',
  },
} as const;

/**
 * Light theme color values (for reference)
 */
export const lightTheme = {
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',     // slate-50
    tertiary: '#f1f5f9',      // slate-100
  },
  foreground: {
    primary: '#0f172a',       // slate-900
    secondary: '#475569',     // slate-600
    muted: '#64748b',         // slate-500
  },
  primary: {
    DEFAULT: '#0d9488',       // teal-600
    hover: '#0f766e',         // teal-700
  },
} as const;

/**
 * Dark theme color values (for reference)
 */
export const darkTheme = {
  background: {
    primary: '#0f172a',       // slate-900
    secondary: '#1e293b',     // slate-800
    tertiary: '#334155',      // slate-700
  },
  foreground: {
    primary: '#f8fafc',       // slate-50
    secondary: '#cbd5e1',     // slate-300
    muted: '#94a3b8',         // slate-400
  },
  primary: {
    DEFAULT: '#14b8a6',       // teal-500
    hover: '#2dd4bf',         // teal-400
  },
} as const;
