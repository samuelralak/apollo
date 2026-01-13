import { useTheme } from '../../../../shared/theme';
import type { Theme } from '../../../../shared/theme';
import {HugeiconsIcon} from "@hugeicons/react";
import type {IconSvgElement} from "@hugeicons/react";
import {Sun03Icon, Moon02Icon, Computer} from "@hugeicons-pro/core-twotone-rounded";
import {Sun03Icon as Sun03SolidIcon, Moon02Icon as Moon02SolidIcon, Computer as ComputerSolid, Tick02Icon as Tick02SolidIcon} from "@hugeicons-pro/core-solid-rounded";

const themeOptions: { value: Theme; label: string; description: string; icon: IconSvgElement; iconSolid: IconSvgElement }[] = [
    {
        value: 'light',
        label: 'Light',
        description: 'Always use light mode',
        icon: Sun03Icon,
        iconSolid: Sun03SolidIcon,
    },
    {
        value: 'dark',
        label: 'Dark',
        description: 'Always use dark mode',
        icon: Moon02Icon,
        iconSolid: Moon02SolidIcon,
    },
    {
        value: 'system',
        label: 'System',
        description: 'Follow your system preference',
        icon: Computer,
        iconSolid: ComputerSolid,
    },
];

const AppearanceSettingsPage = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">Appearance</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Customize how Apollo looks on your device.
                </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
                <fieldset>
                    <legend className="text-sm font-medium text-slate-600 dark:text-slate-300">Theme</legend>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Choose how Apollo appears to you.
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setTheme(option.value)}
                                className={`relative flex flex-col items-center rounded-lg border-2 p-4 transition-colors ${
                                    theme === option.value
                                        ? 'border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-950'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {theme === option.value && (
                                    <span className="absolute right-2 top-2">
                                        <HugeiconsIcon icon={Tick02SolidIcon} className="text-teal-600 dark:text-teal-500" size={18} />
                                    </span>
                                )}
                                <HugeiconsIcon
                                    icon={theme === option.value ? option.iconSolid : option.icon}
                                    className={theme === option.value
                                        ? 'text-teal-600 dark:text-teal-500'
                                        : 'text-slate-500 dark:text-slate-400'}
                                    size={28}
                                />
                                <span
                                    className={`mt-2 text-sm font-medium ${
                                        theme === option.value
                                            ? 'text-teal-600 dark:text-teal-500'
                                            : 'text-slate-900 dark:text-slate-100'
                                    }`}
                                >
                                    {option.label}
                                </span>
                                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-center">
                                    {option.description}
                                </span>
                            </button>
                        ))}
                    </div>
                </fieldset>
            </div>
        </div>
    );
};

export default AppearanceSettingsPage;
