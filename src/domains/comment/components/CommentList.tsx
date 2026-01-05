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

    const commentList = comments ? Object.values(comments.data) : []

    if (commentList.length === 0) {
        return null
    }

    return (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <ul role="list" className="space-y-3">
                {commentList.map((comment) => (
                    <li key={comment.id} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-0.5 shrink-0 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <p className="flex-1">
                            <span className="text-slate-700 dark:text-slate-300">{comment.content}</span>
                            {' – '}
                            <EventOwner pubkey={comment.pubkey} mini={true} hideAvatar={true} inline={true} />
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                {' · '}
                                <time dateTime={new Date(comment.createdAt * 1000).toISOString()}>
                                    {formatDateTime(comment.createdAt)}
                                </time>
                            </span>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default CommentsList
