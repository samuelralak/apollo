import type {ReactNode} from "react";
import type {UseFormReturn} from "react-hook-form";
import SelectMenu from "../../../../shared/components/forms/SelectMenu";
import {Category} from "../../../../shared/types/category.types";
import categories from "../../../../data/categories.json";
import type {QuestionFormValues} from "../../hooks/useQuestionForm";

const options: Category[] = categories

interface Props {
    form: UseFormReturn<QuestionFormValues>;
    defaultCategory?: string;
}

const CategorySection = ({form, defaultCategory}: Props) => {
    const {setValue, formState: {errors}} = form

    return (
        <div className="sm:col-span-4">
            <label htmlFor="category" className="block font-medium leading-6 text-slate-900 dark:text-slate-100">
                Category<span className="text-red-500 ml-0.5">*</span>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
                    Please choose the appropriate section for your question
                </p>
            </label>
            <div className="mt-5 w-full">
                <SelectMenu
                    options={options}
                    idKey={'slug'}
                    descriptionKey={'description'}
                    placeholder={'Select a category'}
                    defaultValue={defaultCategory ? options.find((o) => o.slug === defaultCategory) : undefined}
                    onChangeCallback={(value) => setValue('category', value)}
                />
            </div>
            {errors.category && (
                <p className="mt-2 text-sm text-red-500">
                    {errors.category.message as ReactNode}
                </p>
            )}
        </div>
    )
}

export default CategorySection
