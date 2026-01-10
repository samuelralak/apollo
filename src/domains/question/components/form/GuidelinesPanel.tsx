import {Disclosure, DisclosureButton, DisclosurePanel} from "@headlessui/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {MinusSignIcon, PlusSignIcon, ArrowDown01Icon, ArrowUp01Icon} from "@hugeicons-pro/core-twotone-rounded";
import {Guideline} from "../../../../shared/types/category.types";
import guidelineData from "../../../../data/guidelines.json";

const guidelines: Record<string, Guideline[]> = guidelineData

interface Props {
    category: string;
}

const GuidelinesContent = ({category}: Props) => (
    <>
        <p className="text text-slate-600 dark:text-slate-400">
            Navigate through these simple steps to tailor your queries.
        </p>

        <dl className="space-y-6 divide-y divide-slate-200 dark:divide-slate-700">
            {guidelines[category] ? guidelines[category]?.map((guideline, index) => (
                <Disclosure as="div" key={`${guideline.summary}-${index}`} className="pt-6"
                            defaultOpen={index === 0}>
                    {({open}) => (
                        <>
                            <dt>
                                <DisclosureButton
                                    className="flex w-full items-start justify-between text-left text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800">
                                    <span className="text-base font-semibold leading-7">
                                        {index + 1}. {guideline.summary}
                                    </span>
                                    <span className="ml-6 flex h-7 items-center text-slate-600 dark:text-slate-400">
                                        {open ? (
                                            <HugeiconsIcon icon={MinusSignIcon} size={24} aria-hidden="true"/>
                                        ) : (
                                            <HugeiconsIcon icon={PlusSignIcon} size={24} aria-hidden="true"/>
                                        )}
                                    </span>
                                </DisclosureButton>
                            </dt>
                            <DisclosurePanel as="dd" className="mt-2 pl-5">
                                <ul className="list-disc">
                                    {guideline.points.map((point, idx) => (
                                        <li key={`${point}-${idx}`}
                                            className="text-base leading-7 text-slate-600 dark:text-slate-400">
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>
            )) : (
                <div className="w-full py-4 my-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 border-dashed">
                    <p className="text-center text-slate-600 dark:text-slate-400">
                        Select a category for guidelines
                    </p>
                </div>
            )}
        </dl>
    </>
)

const GuidelinesPanel = ({category}: Props) => {
    return (
        <section className="lg:col-span-1 lg:col-start-3">
            <div className="divide-y divide-slate-200 dark:divide-slate-700 overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow dark:shadow-slate-900/50">
                {/* Mobile: Collapsible */}
                <Disclosure as="div" className="lg:hidden">
                    {({open}) => (
                        <>
                            <DisclosureButton className="flex w-full items-center justify-between px-4 py-5 sm:px-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 dark:focus-visible:ring-teal-500">
                                <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-slate-100">
                                    Craft your question
                                </h3>
                                <span className="text-slate-600 dark:text-slate-400">
                                    {open ? (
                                        <HugeiconsIcon icon={ArrowUp01Icon} size={20} aria-hidden="true"/>
                                    ) : (
                                        <HugeiconsIcon icon={ArrowDown01Icon} size={20} aria-hidden="true"/>
                                    )}
                                </span>
                            </DisclosureButton>
                            <DisclosurePanel className="px-4 py-5 sm:p-6 border-t border-slate-200 dark:border-slate-700">
                                <GuidelinesContent category={category} />
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>

                {/* Desktop: Always visible */}
                <div className="hidden lg:block">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-slate-100">
                            Craft your question
                        </h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <GuidelinesContent category={category} />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default GuidelinesPanel
