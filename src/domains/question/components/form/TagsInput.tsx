import type {ReactNode} from "react";
import type {UseFormReturn} from "react-hook-form";
import {HugeiconsIcon} from "@hugeicons/react";
import {Cancel01Icon} from "@hugeicons-pro/core-twotone-rounded";
import {classNames} from "../../../../utils";
import useTagsInput from "../../hooks/useTagsInput";
import type {QuestionFormValues} from "../../hooks/useQuestionForm";
import {formStyles, getInputContainerClassName} from "../../../../shared/styles/form.styles";

interface Props {
    form: UseFormReturn<QuestionFormValues>;
}

const TagsInput = ({form}: Props) => {
    const {setValue, watch, formState: {errors}} = form
    const {tags, onKeyDown, onRemove, isFocused, onToggleFocus} = useTagsInput(setValue, watch)

    return (
        <div className={formStyles.field.base}>
            <label htmlFor="tags" className={formStyles.label.base}>
                Tags<span className={formStyles.label.required}>*</span>
                <p className={formStyles.description.base}>
                    Add up to 5 tags to describe what your question is about:
                </p>
            </label>
            <div className={formStyles.field.inputWrapper}>
                <div
                    className={classNames(
                        getInputContainerClassName({ isFocused }),
                        "flex flex-wrap w-full",
                        formStyles.inputContainer.focusWithin
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
                        className={`${formStyles.innerInput.base} ${formStyles.innerInput.padding}`}
                        placeholder="comma or space separated values"
                        onInput={onKeyDown}
                        onFocus={onToggleFocus}
                        onBlur={onToggleFocus}
                    />
                </div>
                {errors.tags && (
                    <p className={formStyles.error.base}>
                        {errors.tags.message as ReactNode}
                    </p>
                )}
            </div>
        </div>
    )
}

export default TagsInput
