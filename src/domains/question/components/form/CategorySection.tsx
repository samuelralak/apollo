import type {ReactNode} from "react";
import type {UseFormReturn} from "react-hook-form";
import SelectMenu from "../../../../shared/components/forms/SelectMenu";
import {Category} from "../../../../shared/types/category.types";
import categories from "../../../../data/categories.json";
import type {QuestionFormValues} from "../../hooks/useQuestionForm";
import {formStyles} from "../../../../shared/styles/form.styles";

const options: Category[] = categories

interface Props {
    form: UseFormReturn<QuestionFormValues>;
    defaultCategory?: string;
}

const CategorySection = ({form, defaultCategory}: Props) => {
    const {setValue, formState: {errors}} = form

    return (
        <div className={formStyles.field.base}>
            <label htmlFor="category" className={formStyles.label.base}>
                Category<span className={formStyles.label.required}>*</span>
                <p className={formStyles.description.base}>
                    Select the type that best matches your question
                </p>
            </label>
            <div className={formStyles.field.inputWrapper}>
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
                <p className={formStyles.error.base}>
                    {errors.category.message as ReactNode}
                </p>
            )}
        </div>
    )
}

export default CategorySection
