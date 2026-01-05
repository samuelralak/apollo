import type {ReactNode} from "react";
import type {UseFormReturn} from "react-hook-form";
import {HugeiconsIcon} from "@hugeicons/react";
import {Cancel01Icon} from "@hugeicons-pro/core-twotone-rounded";
import {classNames} from "../../../../utils";
import useTagsInput from "../../hooks/useTagsInput";
import type {QuestionFormValues} from "../../hooks/useQuestionForm";

interface Props {
    form: UseFormReturn<QuestionFormValues>;
}

const TagsInput = ({form}: Props) => {
    const {setValue, watch, formState: {errors}} = form
    const {tags, onKeyDown, onRemove, isFocused, onToggleFocus} = useTagsInput(setValue, watch)

    return (
        <div className="sm:col-span-4">
            <label htmlFor="tags" className="block font-medium leading-6 text-slate-900 dark:text-slate-100">
                Tags
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
                    Add up to 5 tags to describe what your question is about:
                </p>
            </label>
            <div className="mt-5 w-full">
                <div
                    className={classNames(
                        isFocused ? "bg-white dark:bg-slate-700" : 'bg-slate-100 dark:bg-slate-800',
                        "flex flex-wrap rounded-lg ring-2 ring-inset ring-slate-200 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-teal-600 dark:focus-within:ring-teal-500 w-full"
                    )}
                >
                    {tags.map((tag: string, index: number) => (
                        <span
                            key={`${tag}-${index}`}
                            className="flex select-none items-center gap-x-0.5 rounded-md bg-teal-600 dark:bg-teal-500 px-2 py-1 text-xs font-medium text-white my-2 h-7 self-center ml-2"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-white/20"
                            >
                                <span className="sr-only">Remove</span>
                                <HugeiconsIcon icon={Cancel01Icon} size={14} />
                                <span className="absolute -inset-1"/>
                            </button>
                        </span>
                    ))}

                    <input
                        type="text"
                        name="tags"
                        className="block flex-1 border-0 bg-transparent py-4 text-sm pl-1 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:outline-none leading-6"
                        placeholder="comma or space separated values"
                        onInput={onKeyDown}
                        onFocus={onToggleFocus}
                        onBlur={onToggleFocus}
                    />
                </div>
                {errors.tags && (
                    <p className="mt-2 text-sm text-red-500">
                        {errors.tags.message as ReactNode}
                    </p>
                )}
            </div>
        </div>
    )
}

export default TagsInput
