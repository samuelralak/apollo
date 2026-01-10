import type {ReactNode} from "react";
import type {UseFormReturn} from "react-hook-form";
import type {QuestionFormValues} from "../../hooks/useQuestionForm";
import {formStyles, getInputClassName, getCounterClassName} from "../../../../shared/styles/form.styles";

const placeholderTitleExamples: Record<string, string> = {
    conversational_and_exploratory: "What life lesson did you learn the hard way and how?",
    technical_and_precise: "What are best practices for optimizing Lightning Network node performance?",
    generalized: "How do diet and exercise contribute to overall mental health?"
}

const defaultPlaceholder = "What specific problem are you trying to solve?"

interface Props {
    form: UseFormReturn<QuestionFormValues>;
    category: string;
    defaultTitle?: string;
}

const TitleInput = ({form, category, defaultTitle}: Props) => {
    const {register, watch, formState: {errors}} = form
    const title = watch('title') ?? ''

    return (
        <div className={formStyles.field.base}>
            <label htmlFor="title" className={formStyles.label.base}>
                Title<span className={formStyles.label.required}>*</span>
                <p className={formStyles.description.base}>
                    Be specific and concise, as if asking a knowledgeable friend
                </p>
            </label>
            <div className={formStyles.field.inputWrapper}>
                <input
                    {...register('title')}
                    defaultValue={defaultTitle ?? ''}
                    type="text"
                    placeholder={category && placeholderTitleExamples[category]
                        ? `e.g. ${placeholderTitleExamples[category]}`
                        : defaultPlaceholder}
                    className={getInputClassName()}
                />
                <div className="mt-1.5 flex justify-end">
                    <span className={getCounterClassName(title.length, 80)}>
                        {title.length}/80
                    </span>
                </div>
            </div>
            {errors.title && (
                <p className={formStyles.error.base}>
                    {errors.title.message as ReactNode}
                </p>
            )}
        </div>
    )
}

export default TitleInput
