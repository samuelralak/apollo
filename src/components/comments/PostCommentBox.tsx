import Question from "../../resources/question.ts";
import {Answer} from "../../resources/answer.ts";
import {NDKKind} from "@nostr-dev-kit/ndk";
import {useContext, useEffect, useState} from "react";
import {NDKContext} from "../NDKProvider.tsx";
import {FieldError, SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import commentSchema from "../../schemas/comment-schema.ts";
import constants from "../../constants";
import {zodResolver} from "@hookform/resolvers/zod";
import {ToastContext} from "../ToastProvider.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import AvatarPlaceholder from "../shared/AvatarPlaceholder.tsx";
import {classNames} from "../../utils";
import {CheckIcon, ExclamationCircleIcon} from "@heroicons/react/20/solid";

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
    const userProfile = useSelector((state: RootState) => state.auth.userProfile);
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
        <div className="flex items-start sm:space-x-4 py-3.5">
            <div className="flex-shrink-0 hidden sm:block">
                {userProfile?.image || userProfile?.picture ? (
                    <img
                        className="inline-block h-9 w-9 rounded-lg object-cover"
                        src={userProfile?.image ?? userProfile?.picture}
                        alt="profile picture"
                    />
                ) : <AvatarPlaceholder/>}
            </div>
            <div className="w-full sm:flex-1">
                <form onSubmit={handleSubmit(handleCommentSubmit)} className="relative">
                    <div
                        className="overflow-hidden rounded-lg ring-2 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-slate-600">
                        <label htmlFor="comment" className="sr-only">
                            Add your comment
                        </label>
                        <textarea
                            {...register('comment')}
                            onInput={() => trigger('comment')}
                            rows={1}
                            className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 placeholder:text-sm focus:ring-0 text-sm"
                            placeholder="Ask for clarification or suggest improvements..."
                        />

                        {/* Spacer element to match the height of the toolbar */}
                        <div className="py-2" aria-hidden="true">
                            {/* Matches height of button in toolbar (1px border + 36px content height) */}
                            <div className="py-px">
                                <div className="h-9"/>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                        <div className="flex items-center justify-center space-x-2">
                            {fieldState?.invalid ? (
                                <ExclamationCircleIcon className="h-4 w-4 text-red-600"/>
                            ) : (
                                <CheckIcon className="h-4 w-4 text-green-600"/>
                            )}

                            <span
                                className={classNames(fieldState?.invalid && fieldState?.isDirty ? "text-red-400" : "text-slate-400", "text-xs font-bold")}>
                                {watchComment?.length ?? 0}/144
                            </span>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                disabled={publishing}
                                type="submit"
                                className="inline-flex items-center rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                            >
                                {publishing ? "publishing..." : "Add comment"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PostCommentBox
