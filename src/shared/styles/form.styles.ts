/**
 * Shared form input styles for consistent UI across the application.
 *
 * Usage:
 * import { formStyles, getInputClassName } from '../../shared/styles/form.styles'
 *
 * // Option 1: Use the helper function
 * <input className={getInputClassName()} />
 * <input className={getInputClassName({ withIcon: 'left' })} />
 *
 * // Option 2: Compose manually
 * <input className={`${formStyles.input.base} ${formStyles.input.padding}`} />
 */

// Base styles shared across all form elements
const baseStyles = {
    // Core input styling
    core: "block w-full rounded-lg border-0 text-sm text-slate-900 dark:text-slate-100 leading-6",

    // Ring/border styling
    ring: "ring-2 ring-slate-200 dark:ring-slate-700",
    ringInset: "ring-2 ring-inset ring-slate-200 dark:ring-slate-700",
    ringFocus: "focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500",
    ringFocusInset: "focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500",
    ringFocusWithin: "focus-within:ring-2 focus-within:ring-inset focus-within:ring-teal-600 dark:focus-within:ring-teal-500",

    // Background colors
    bg: "bg-slate-100 dark:bg-slate-800",
    bgFocus: "focus:bg-white dark:focus:bg-slate-700",
    bgFocusWithin: "focus-within:bg-white dark:focus-within:bg-slate-700",

    // Placeholder styling
    placeholder: "placeholder:text-slate-400",

    // Transitions
    transition: "transition-colors",
} as const

// Padding configurations
const padding = {
    input: "py-3 px-3",
    textarea: "py-2.5 px-3",
    inputWithLeftIcon: "py-3 pl-10 pr-3",
    inputWithRightIcon: "py-3 pl-3 pr-10",
    inputWithBothIcons: "py-3 pl-10 pr-10",
    tagInput: "py-3 pl-2",  // For inputs inside tag containers
} as const

// Complete input styles
export const formStyles = {
    // Standard text input
    input: {
        base: `${baseStyles.core} ${baseStyles.ring} ${baseStyles.bg} ${baseStyles.bgFocus} ${baseStyles.ringFocus} ${baseStyles.placeholder}`,
        padding: padding.input,
        withLeftIcon: padding.inputWithLeftIcon,
        withRightIcon: padding.inputWithRightIcon,
        withBothIcons: padding.inputWithBothIcons,
    },

    // Textarea
    textarea: {
        base: `${baseStyles.core} ${baseStyles.ring} ${baseStyles.bg} ${baseStyles.bgFocus} ${baseStyles.ringFocus} ${baseStyles.placeholder}`,
        padding: padding.textarea,
    },

    // Select/Listbox button
    select: {
        base: `inline-flex w-full items-center justify-between rounded-lg text-sm text-slate-700 dark:text-slate-200 ${baseStyles.ring} ${baseStyles.bg} hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none ${baseStyles.ringFocus} ${baseStyles.bgFocus}`,
        padding: padding.input,
    },

    // Container for inputs with focus-within behavior (e.g., TagsInput, UserSearch)
    inputContainer: {
        base: `rounded-lg ${baseStyles.ring} ${baseStyles.transition}`,
        states: {
            default: baseStyles.bg,
            focused: "bg-white dark:bg-slate-700 ring-teal-600 dark:ring-teal-500",
        },
        focusWithin: `${baseStyles.ringFocusWithin}`,
    },

    // Inner input (inside a container, no ring/bg of its own)
    innerInput: {
        base: "block flex-1 border-0 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:outline-none leading-6",
        padding: padding.tagInput,
    },

    // Combobox input (inside a styled container)
    comboboxInput: {
        base: "w-full border-none bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:outline-none leading-6",
        padding: padding.inputWithBothIcons,
    },

    // Labels
    label: {
        base: "block font-medium leading-6 text-slate-900 dark:text-slate-100",
        small: "block text-sm font-medium leading-6 text-slate-600 dark:text-slate-300",
        required: "text-red-500 ml-0.5",
    },

    // Description/helper text
    description: {
        base: "mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal",
    },

    // Error messages
    error: {
        base: "mt-2 text-sm text-red-500",
    },

    // Character counter
    counter: {
        base: "text-xs",
        default: "text-slate-400 dark:text-slate-500",
        warning: "text-amber-500",
        error: "text-red-500",
    },

    // Form field wrapper
    field: {
        base: "sm:col-span-4",
        inputWrapper: "mt-5 w-full",
        inputWrapperCompact: "mt-2 w-full",
    },
} as const

// Helper types
type IconPosition = 'left' | 'right' | 'both' | 'none'

interface InputClassNameOptions {
    withIcon?: IconPosition
    inset?: boolean
}

interface TextareaClassNameOptions {
    inset?: boolean
}

interface ContainerClassNameOptions {
    isFocused: boolean
}

/**
 * Get complete className for a standard input
 */
export function getInputClassName(options: InputClassNameOptions = {}): string {
    const { withIcon = 'none', inset = false } = options

    const paddingClass = {
        none: formStyles.input.padding,
        left: formStyles.input.withLeftIcon,
        right: formStyles.input.withRightIcon,
        both: formStyles.input.withBothIcons,
    }[withIcon]

    if (inset) {
        return `${baseStyles.core} ${baseStyles.ringInset} ${baseStyles.bg} ${baseStyles.bgFocus} ${baseStyles.ringFocusInset} ${baseStyles.placeholder} ${paddingClass}`
    }

    return `${formStyles.input.base} ${paddingClass}`
}

/**
 * Get complete className for a textarea
 */
export function getTextareaClassName(options: TextareaClassNameOptions = {}): string {
    const { inset = false } = options

    if (inset) {
        return `${baseStyles.core} ${baseStyles.ringInset} ${baseStyles.bg} ${baseStyles.bgFocus} ${baseStyles.ringFocusInset} ${baseStyles.placeholder} ${formStyles.textarea.padding}`
    }

    return `${formStyles.textarea.base} ${formStyles.textarea.padding}`
}

/**
 * Get complete className for a select button
 */
export function getSelectClassName(): string {
    return `${formStyles.select.base} ${formStyles.select.padding}`
}

/**
 * Get className for an input container based on focus state
 */
export function getInputContainerClassName(options: ContainerClassNameOptions): string {
    const { isFocused } = options
    const stateClass = isFocused
        ? formStyles.inputContainer.states.focused
        : formStyles.inputContainer.states.default

    return `${formStyles.inputContainer.base} ${stateClass}`
}

/**
 * Get className for character counter based on length
 */
export function getCounterClassName(length: number, max: number, min?: number): string {
    if (length > max) {
        return `${formStyles.counter.base} ${formStyles.counter.error}`
    }
    if (min !== undefined && length < min) {
        return `${formStyles.counter.base} ${formStyles.counter.warning}`
    }
    return `${formStyles.counter.base} ${formStyles.counter.default}`
}

export default formStyles
