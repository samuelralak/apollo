import {Fragment, useState} from 'react'
import {Listbox, Transition} from '@headlessui/react'
import {CheckIcon, ChevronDownIcon} from '@heroicons/react/20/solid'
import {classNames} from "../../utils";

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

const SelectMenu = <T extends Option>({options, idKey, descriptionKey, defaultValue, placeholder, onChangeCallback}: Props<T>) => {
    const [selected, setSelected] = useState<T | undefined>(defaultValue)
    const onChange = (value: T) => {
        if (onChangeCallback) {
            onChangeCallback(value[idKey]!)
        }
        setSelected(value)
    }

    return (
        <Listbox value={selected} onChange={onChange}>
            {({open}) => (
                <>
                    <Listbox.Label className="sr-only">Change published status</Listbox.Label>
                    <div className="relative">
                        <Listbox.Button
                            className="inline-flex w-full items-center justify-between rounded-lg bg-slate-100 ring-2 ring-slate-200 p-3.5 text-sm text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 focus:ring-offset-slate-50">
                            <span>{selected?.title ?? placeholder}</span>
                            <ChevronDownIcon className="h-6 w-6 text-slate-900" aria-hidden="true"/>
                        </Listbox.Button>

                        <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options
                                className="absolute w-full z-10 mt-2 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {options.map((option) => (
                                    <Listbox.Option
                                        key={option[idKey]}
                                        className={({active}) =>
                                            classNames(
                                                active ? 'bg-blue-600 text-white' : 'text-gray-900',
                                                'cursor-default select-none p-4 text-sm'
                                            )
                                        }
                                        value={option}
                                    >
                                        {({selected, active}) => (
                                            <div className="flex flex-col">
                                                <div className="flex justify-between">
                                                    <p className={selected ? 'font-semibold' : 'font-normal'}>{option.title}</p>

                                                    {selected ? (
                                                        <span className={active ? 'text-white' : 'text-blue-600'}>
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true"/>
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {option[descriptionKey] && (
                                                    <p className={classNames(active ? 'text-blue-200' : 'text-gray-500', 'mt-2')}>
                                                        {option[descriptionKey]}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </div>
                </>
            )}
        </Listbox>
    )
}

export default SelectMenu
