import type {Question} from "../../question/types/question.types";
import type {Answer} from "../../answer/types/answer.types";
import {NDKKind} from "@nostr-dev-kit/ndk";
import {useContext, useEffect, useState} from "react";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import {FieldError, SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import commentSchema from "../schemas/comment.schema";
import constants from "../../../constants";
import {zodResolver} from "@hookform/resolvers/zod";
import {ToastContext} from "../../../shared/components/feedback/ToastProvider";
import {classNames} from "../../../utils";

interface Props {
    resource: Question | Answer;
    resourceKind: NDKKind;
}

interface FieldState {
    isDirty: boolean;
    isTouched: boolean;
    invalid: boolean;
    error?: FieldError;
}

type CommentSchema = z.infer<typeof commentSchema>

const PostCommentBox = ({resource, resourceKind}: Props) => {
    const {showToast} = useContext(ToastContext) as ToastContext
    const {publishEvent} = useContext(NDKContext) as NDKContext
    const {
        handleSubmit,
        register,
        resetField,
        watch,
        getFieldState,
        trigger
    } = useForm<CommentSchema>({resolver: zodResolver(commentSchema)})
    const [publishing, setPublishing] = useState<boolean>(false)
    const [fieldState, setFieldState] = useState<FieldState>();
    const watchComment = watch('comment')

    const handleCommentSubmit: SubmitHandler<CommentSchema> = async ({comment}) => {
        setPublishing(true)
        try {
            await publishEvent(constants.noteKind, comment, [
                ["e", resource.eventId, "", "root"],
                ["p", resource.user.pubkey],
                ["a", `${resourceKind}:${resource.user.pubkey}:${resource.id}`],
                ["alt", "comment"]
            ])

            showToast({title: 'Your comment is publishing', type: 'success'})
        } catch (e) {
            if (e instanceof Error) {
                showToast({title: e.message, type: 'error'})
            }
        }

        setPublishing(false)
        resetField('comment')
    }

    useEffect(() => {
        (() => {
            const currentFieldState = getFieldState('comment')
            setFieldState(currentFieldState)
        })()
    }, [watchComment]);

    return (
        <form onSubmit={handleSubmit(handleCommentSubmit)} className="mt-3">
            <textarea
                {...register('comment')}
                onInput={() => trigger('comment')}
                rows={2}
                className="block w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:focus:border-teal-500"
                placeholder="Add a comment..."
            />
            <div className="flex items-center justify-between mt-2">
                <span className={classNames(
                    fieldState?.invalid && fieldState?.isDirty ? "text-red-400" : "text-slate-400",
                    "text-xs"
                )}>
                    {watchComment?.length ?? 0}/144
                </span>
                <button
                    disabled={publishing || fieldState?.invalid}
                    type="submit"
                    className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 disabled:text-slate-400 dark:disabled:text-slate-500 transition-colors"
                >
                    {publishing ? "Adding..." : "Add comment"}
                </button>
            </div>
        </form>
    )
}

export default PostCommentBox
