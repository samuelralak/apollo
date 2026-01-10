import {useState} from 'react'
import {Listbox, ListboxButton, ListboxLabel, ListboxOptions, ListboxOption} from '@headlessui/react'
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowDown01Icon} from "@hugeicons-pro/core-twotone-rounded";
import {Tick02Icon as Tick02SolidIcon} from "@hugeicons-pro/core-solid-rounded";
import {getSelectClassName} from "../../styles/form.styles";

interface Option {
    [key: string]: string | undefined;

    title: string;
}

interface Props<T extends Option> {
    options: T[];
    idKey: string;
    descriptionKey: string;
    defaultValue?: T;
    placeholder?: string;
    onChangeCallback?: (value: string) => void
}

const SelectMenu = <T extends Option>({
                                          options,
                                          idKey,
                                          descriptionKey,
                                          defaultValue,
                                          placeholder,
                                          onChangeCallback
                                      }: Props<T>) => {
    const [selected, setSelected] = useState<T | undefined>(defaultValue)

    const onChange = (value: T) => {
        if (onChangeCallback) {
            onChangeCallback(value[idKey]!)
        }
        setSelected(value)
    }

    return (
        <Listbox value={selected} onChange={onChange}>
            <ListboxLabel className="sr-only">Change published status</ListboxLabel>
            <div className="relative">
                <ListboxButton className={getSelectClassName()}>
                    <span>{selected?.title ?? placeholder}</span>
                    <HugeiconsIcon icon={ArrowDown01Icon} className="text-slate-600 dark:text-slate-400" size={24} aria-hidden="true" />
                </ListboxButton>

                <ListboxOptions
                    transition
                    className="absolute w-full z-10 mt-2 origin-top-right divide-y divide-slate-200 dark:divide-slate-700 overflow-hidden rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none transition ease-in duration-100 data-[closed]:opacity-0">
                    {options.map((option) => (
                        <ListboxOption
                            key={option[idKey]}
                            className="cursor-default select-none p-4 text-sm text-slate-900 dark:text-slate-100 data-[focus]:bg-teal-600 data-[focus]:text-white"
                            value={option}
                        >
                            {({selected}) => (
                                <div className="flex flex-col">
                                    <div className="flex justify-between">
                                        <p className={selected ? 'font-semibold' : 'font-normal'}>{option.title}</p>

                                        {selected ? (
                                            <span className="text-teal-600 dark:text-teal-500 data-[focus]:text-white">
                                                <HugeiconsIcon icon={Tick02SolidIcon} size={20} aria-hidden="true" />
                                            </span>
                                        ) : null}
                                    </div>

                                    {option[descriptionKey] && (
                                        <p className="mt-2 text-slate-500 dark:text-slate-400 data-[focus]:text-teal-100">
                                            {option[descriptionKey]}
                                        </p>
                                    )}
                                </div>
                            )}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </div>
        </Listbox>
    )
}

export default SelectMenu
