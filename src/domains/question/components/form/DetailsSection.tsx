import type {ReactNode} from "react";
import type {UseFormReturn} from "react-hook-form";
import MDEditor from "@uiw/react-md-editor";
import {commandsFilter} from "../../../../utils/md-editor";
import type {QuestionFormValues} from "../../hooks/useQuestionForm";
import {formStyles, getCounterClassName} from "../../../../shared/styles/form.styles";

interface Props {
    form: UseFormReturn<QuestionFormValues>;
}

const DetailsSection = ({form}: Props) => {
    const {setValue, watch, formState: {errors}} = form
    const description = watch('description')
    const length = description?.length ?? 0

    const onEditorValueChange = (value?: string) => setValue('description', value!)

    return (
        <div className={formStyles.field.base}>
            <label htmlFor="description" className={formStyles.label.base}>
                Details<span className={formStyles.label.required}>*</span>
                <p className={formStyles.description.base}>
                    Provide context, what you've tried, and what you're hoping to learn
                </p>
            </label>
            <div className={formStyles.field.inputWrapper}>
                <MDEditor
                    value={description}
                    onChange={onEditorValueChange}
                    commandsFilter={commandsFilter}
                    preview={'edit'}
                    className="prose prose-slate dark:prose-invert max-w-none"
                />
                <div className="mt-1.5 flex justify-between">
                    <span className={getCounterClassName(length, 1440, 50)}>
                        Min: 50 characters
                    </span>
                    <span className={getCounterClassName(length, 1440, 50)}>
                        {length}/1440
                    </span>
                </div>
            </div>
            {errors.description && (
                <p className={formStyles.error.base}>
                    {errors.description.message as ReactNode}
                </p>
            )}
        </div>
    )
}

export default DetailsSection
