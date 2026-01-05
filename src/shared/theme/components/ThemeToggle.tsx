import { HugeiconsIcon } from '@hugeicons/react';
import { Sun01Icon, Moon01Icon } from '@hugeicons-pro/core-duotone-rounded';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
    className?: string;
}

/**
 * A simple toggle button to switch between light and dark themes.
 * Clicking cycles through: current -> opposite theme
 * For full theme options (including system), use the Appearance settings page.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const { resolvedTheme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`relative rounded-full p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors ${className}`}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <span className="sr-only">
                Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} mode
            </span>
            {resolvedTheme === 'dark' ? (
                <HugeiconsIcon icon={Sun01Icon} size={20} />
            ) : (
                <HugeiconsIcon icon={Moon01Icon} size={20} />
            )}
        </button>
    );
}

export default ThemeToggle;
