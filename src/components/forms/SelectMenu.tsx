import {useState} from 'react'
import {Listbox, ListboxButton, ListboxLabel, ListboxOptions, ListboxOption} from '@headlessui/react'
import {CheckIcon, ChevronDownIcon} from '@heroicons/react/20/solid'

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
                <ListboxButton
                    className="inline-flex w-full items-center justify-between rounded-lg bg-slate-100 ring-2 ring-slate-200 p-3.5 text-sm text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-50">
                    <span>{selected?.title ?? placeholder}</span>
                    <ChevronDownIcon className="h-6 w-6 text-slate-900" aria-hidden="true"/>
                </ListboxButton>

                <ListboxOptions
                    transition
                    className="absolute w-full z-10 mt-2 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-in duration-100 data-[closed]:opacity-0">
                    {options.map((option) => (
                        <ListboxOption
                            key={option[idKey]}
                            className="cursor-default select-none p-4 text-sm text-gray-900 data-[focus]:bg-blue-600 data-[focus]:text-white"
                            value={option}
                        >
                            {({selected}) => (
                                <div className="flex flex-col">
                                    <div className="flex justify-between">
                                        <p className={selected ? 'font-semibold' : 'font-normal'}>{option.title}</p>

                                        {selected ? (
                                            <span className="text-blue-600 data-[focus]:text-white">
                                                <CheckIcon className="h-5 w-5" aria-hidden="true"/>
                                            </span>
                                        ) : null}
                                    </div>

                                    {option[descriptionKey] && (
                                        <p className="mt-2 text-gray-500 data-[focus]:text-blue-200">
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
