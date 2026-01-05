import type {Question} from "../../question/types/question.types";
import type {Answer} from "../../answer/types/answer.types";
import {NDKEvent, NDKKind} from "@nostr-dev-kit/ndk";
import useNDKSubscription from "../../../shared/hooks/useNDKSubscription";
import constants from "../../../constants";
import {commentTransformer} from "../services/comment.transformer"
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {addComment} from "../store/comment.slice";
import {formatDateTime} from "../../../utils";
import EventOwner from "../../user/components/EventOwner";

interface Props {
    resource: Question | Answer;
    resourceKind: NDKKind;
}

const CommentsList = ({resource, resourceKind}: Props) => {
    const dispatch = useDispatch<AppDispatch>()
    const comments = useSelector((state: RootState) => state.comment)[resource.id ?? ""]

    const handleResourceEvent = (event: NDKEvent) => {
        const fromEvent = commentTransformer(event)
        dispatch(addComment({key: fromEvent.id, item: fromEvent}))
    }

    useNDKSubscription({
        kinds: [constants.noteKind],
        "#a": [`${resourceKind}:${resource.user.pubkey}:${resource.id}`]
    }, {closeOnEose: false}, handleResourceEvent)

    return (
        <div className="w-full">
            <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-700 border-y border-slate-200 dark:border-slate-700 mt-3.5">
                {comments && [...Object.values(comments.data)]?.map((comment) => (
                    <li key={comment.id} className="flex gap-x-4 py-2">
                        <div className="flex-auto w-full overflow-scroll">
                            <div className="flex items-baseline justify-between space-x-4">
                                <EventOwner pubkey={comment.pubkey} mini={true} hideAvatar={true} />

                                <p className="flex-none text-xs text-slate-500 dark:text-slate-400">
                                    <time
                                        dateTime={new Date(comment.createdAt * 1000).toDateString()}
                                    >
                                        {formatDateTime(comment.createdAt)}
                                    </time>
                                </p>
                            </div>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-full text-wrap">{comment.content}</p>
                        </div>
                    </li>
                ))}
            </ul>

            {/*<button
                className="w-full text-sm bg-slate-100 my-2.5 py-2.5 px-1.5 font-medium text-slate-600 rounded-md cursor-pointer hover:bg-slate-200">
                <p>
                    351 comments from Samuel Ralak and more
                </p>
            </button>*/}
        </div>

    )
}

export default CommentsList
