import { useTheme } from '../../../../shared/theme';
import type { Theme } from '../../../../shared/theme';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

const themeOptions: { value: Theme; label: string; description: string; icon: typeof SunIcon }[] = [
    {
        value: 'light',
        label: 'Light',
        description: 'Always use light mode',
        icon: SunIcon,
    },
    {
        value: 'dark',
        label: 'Dark',
        description: 'Always use dark mode',
        icon: MoonIcon,
    },
    {
        value: 'system',
        label: 'System',
        description: 'Follow your system preference',
        icon: ComputerDesktopIcon,
    },
];

const AppearanceSettingsPage = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
                <h2 className="text-base font-semibold leading-7 text-foreground-primary">Appearance</h2>
                <p className="mt-1 text-sm leading-6 text-foreground-muted mb-5">
                    Customize how Apollo looks on your device.
                </p>

                <div className="border-t border-border-default pt-5">
                    <fieldset>
                        <legend className="text-sm font-medium text-foreground-secondary">Theme</legend>
                        <p className="mt-1 text-sm text-foreground-muted">
                            Choose how Apollo appears to you.
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {themeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setTheme(option.value)}
                                    className={`relative flex flex-col items-center rounded-lg border-2 p-4 transition-colors ${
                                        theme === option.value
                                            ? 'border-primary bg-primary-bg'
                                            : 'border-border-default bg-background-primary hover:border-border-strong hover:bg-background-hover'
                                    }`}
                                >
                                    {theme === option.value && (
                                        <span className="absolute right-2 top-2">
                                            <CheckIcon className="h-5 w-5 text-primary" />
                                        </span>
                                    )}
                                    <option.icon
                                        className={`h-8 w-8 ${
                                            theme === option.value
                                                ? 'text-primary'
                                                : 'text-foreground-muted'
                                        }`}
                                    />
                                    <span
                                        className={`mt-2 text-sm font-medium ${
                                            theme === option.value
                                                ? 'text-primary'
                                                : 'text-foreground-primary'
                                        }`}
                                    >
                                        {option.label}
                                    </span>
                                    <span className="mt-1 text-xs text-foreground-muted text-center">
                                        {option.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettingsPage;
