import type {ReactNode} from "react";
import type {UseFormReturn} from "react-hook-form";
import MDEditor from "@uiw/react-md-editor";
import {commandsFilter} from "../../../../utils/md-editor";
import type {QuestionFormValues} from "../../hooks/useQuestionForm";

interface Props {
    form: UseFormReturn<QuestionFormValues>;
}

const DetailsSection = ({form}: Props) => {
    const {setValue, watch, formState: {errors}} = form
    const description = watch('description')

    const onEditorValueChange = (value?: string) => setValue('description', value!)

    return (
        <div className="sm:col-span-4">
            <label htmlFor="description" className="block font-medium leading-6 text-slate-900 dark:text-slate-100">
                Details<span className="text-red-500 ml-0.5">*</span>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
                    Include all the information someone would need to answer your question
                </p>
            </label>
            <div className="mt-5 w-full">
                <MDEditor
                    value={description}
                    onChange={onEditorValueChange}
                    commandsFilter={commandsFilter}
                    preview={'edit'}
                    className="prose prose-slate dark:prose-invert max-w-none"
                />
                <div className="mt-1.5 flex justify-between">
                    <span className={`text-xs ${(description?.length ?? 0) < 50 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
                        Min: 50 characters
                    </span>
                    <span className={`text-xs ${
                        (description?.length ?? 0) < 50 ? 'text-amber-500' :
                        (description?.length ?? 0) > 1440 ? 'text-red-500' :
                        'text-slate-400 dark:text-slate-500'
                    }`}>
                        {description?.length ?? 0}/1440
                    </span>
                </div>
            </div>
            {errors.description && (
                <p className="mt-2 text-sm text-red-500">
                    {errors.description.message as ReactNode}
                </p>
            )}
        </div>
    )
}

export default DetailsSection
