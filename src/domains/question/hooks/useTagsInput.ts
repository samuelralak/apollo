import {KeyboardEvent, useState} from "react";
import type {UseFormSetValue, UseFormWatch} from "react-hook-form";
import type {QuestionFormValues} from "./useQuestionForm";

const useTagsInput = (
    setValue: UseFormSetValue<QuestionFormValues>,
    watch: UseFormWatch<QuestionFormValues>
) => {
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const tags = watch('tags')

    const onToggleFocus = () => setIsFocused(!isFocused)

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const currentTarget = event.currentTarget as HTMLInputElement
        const tagInputValue = currentTarget.value

        if (tagInputValue && /\s|,/.test(tagInputValue)) {
            event.preventDefault();
            const tag = tagInputValue.replace(',', '').trim()

            if (tag) {
                setValue('tags', [...tags, tag.toLowerCase()]);
                currentTarget.value = ''
            }
        }
    }

    const onRemove = (index: number) => {
        const updatedTags: string[] = [...tags]
        updatedTags.splice(index, 1)
        setValue('tags', updatedTags)
    }

    return {tags, onKeyDown, onRemove, isFocused, onToggleFocus}
}

export default useTagsInput
