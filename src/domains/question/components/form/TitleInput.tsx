import type {ReactNode} from "react";
import type {UseFormReturn} from "react-hook-form";
import type {QuestionFormValues} from "../../hooks/useQuestionForm";

const placeholderTitleExamples: Record<string, string> = {
    conversational_and_exploratory: "What life lesson did you learn the hard way and how?",
    technical_and_precise: "What are best practices for optimizing Lightning Network node performance?",
    generalized: "How do diet and exercise contribute to overall mental health?"
}

interface Props {
    form: UseFormReturn<QuestionFormValues>;
    category: string;
    defaultTitle?: string;
}

const TitleInput = ({form, category, defaultTitle}: Props) => {
    const {register, watch, formState: {errors}} = form
    const title = watch('title') ?? ''

    return (
        <div className="sm:col-span-4">
            <label htmlFor="title" className="block font-medium leading-6 text-slate-900 dark:text-slate-100">
                Question Title<span className="text-red-500 ml-0.5">*</span>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
                    Imagine you are asking a question to another person
                </p>
            </label>
            <div className="mt-5 w-full">
                <input
                    {...register('title')}
                    defaultValue={defaultTitle ?? ''}
                    type="text"
                    placeholder={`e.g ${placeholderTitleExamples[category] ?? ''}`}
                    className="block w-full border-0 focus:border-0 rounded-lg py-3 px-3 text-sm text-slate-900 dark:text-slate-100 ring-2 outline-none ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500 leading-6"
                />
                <div className="mt-1.5 flex justify-end">
                    <span className={`text-xs ${title.length > 80 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                        {title.length}/80
                    </span>
                </div>
            </div>
            {errors.title && (
                <p className="mt-2 text-sm text-red-500">
                    {errors.title.message as ReactNode}
                </p>
            )}
        </div>
    )
}

export default TitleInput
