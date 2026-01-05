import {memo} from "react";
import {Link} from "react-router";
import {CheckCircleIcon} from "@heroicons/react/16/solid";
import {EllipsisHorizontalIcon} from "@heroicons/react/20/solid";
import {Menu, MenuButton, MenuItems, MenuItem} from "@headlessui/react";
import {useDispatch, useSelector} from "react-redux";
import type {Question} from "../types/question.types";
import {formatDateTime, markdownToText} from "../../../utils";
import EventOwner from "../../user/components/EventOwner";
import constants from "../../../constants";
import {AppDispatch, RootState} from "../../../app/store";
import {PortalID, showPortal} from "../../../shared/store/portal.slice";

interface QuestionListItemBProps {
    question: Question;
    showPreview?: boolean;
}

/**
 * Compact Cards style question list item
 * - Full width card
 * - Title, preview, tags as pills
 * - Inline stats: votes · answers · time · author
 * - Accepted answer indicator
 */
const QuestionListItemB = memo(({question, showPreview = true}: QuestionListItemBProps) => {
    const auth = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch() as AppDispatch;

    const hasAcceptedAnswer = !!question.acceptedAnswerId;
    // Static for now - will be dynamic later
    const voteCount: number = 0;
    const answerCount: number = 0;

    const handleShowModal = (portalId: PortalID) => dispatch(showPortal({
        portalId: portalId,
        pubkey: question.user.pubkey,
        eventId: question.eventId,
        eventCoordinate: `${constants.questionKind}:${question.user.pubkey}:${question.id}`
    }));

    return (
        <li className="py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {/* Title */}
            <Link
                to={`/questions/${question.id}`}
                className="text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-2"
            >
                {question.title}
            </Link>

            {/* Preview */}
            {showPreview && question.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                    {markdownToText(question.description)}
                </p>
            )}

            {/* Tags as pills */}
            {question.tags && question.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {question.tags.map((tag, index) => (
                        <span
                            key={`${question.id}-${tag}-${index}`}
                            className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Stats and actions - always same row */}
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                {/* Stats */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span>{voteCount} votes</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className={`inline-flex items-center gap-1 ${
                        hasAcceptedAnswer
                            ? 'text-green-600 dark:text-green-400'
                            : answerCount > 0
                                ? 'text-teal-600 dark:text-teal-400'
                                : ''
                    }`}>
                        {hasAcceptedAnswer && (
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                        )}
                        {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span>{formatDateTime(question.createdAt)}</span>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-600">·</span>
                    <span className="hidden sm:inline"><EventOwner pubkey={question.user.pubkey} mini={true} /></span>
                </div>

                {/* Actions */}
                <div className="flex items-center shrink-0">
                    {/* Desktop: text links */}
                    <div className="hidden sm:flex items-center gap-x-3 font-medium">
                        <a onClick={() => handleShowModal(PortalID.share)}
                           className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                            Share
                        </a>
                        {auth.isLoggedIn && (
                            <>
                                <a onClick={() => handleShowModal(PortalID.zap)}
                                   className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                                    Zap
                                </a>
                                {auth.pubkey === question.user.pubkey && (
                                    <Link
                                        to={`/questions/${question.id}/edit`}
                                        className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                        Edit
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile: ellipsis menu */}
                    <Menu as="div" className="relative sm:hidden">
                        <MenuButton className="p-1 -m-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                            <span className="sr-only">Actions</span>
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none">
                            <div className="py-1">
                                <MenuItem>
                                    <a
                                        onClick={() => handleShowModal(PortalID.share)}
                                        className="block px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-700 cursor-pointer"
                                    >
                                        Share
                                    </a>
                                </MenuItem>
                                {auth.isLoggedIn && (
                                    <>
                                        <MenuItem>
                                            <a
                                                onClick={() => handleShowModal(PortalID.zap)}
                                                className="block px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-700 cursor-pointer"
                                            >
                                                Zap
                                            </a>
                                        </MenuItem>
                                        {auth.pubkey === question.user.pubkey && (
                                            <MenuItem>
                                                <Link
                                                    to={`/questions/${question.id}/edit`}
                                                    className="block px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-700"
                                                >
                                                    Edit
                                                </Link>
                                            </MenuItem>
                                        )}
                                    </>
                                )}
                            </div>
                        </MenuItems>
                    </Menu>
                </div>
            </div>
        </li>
    );
});

QuestionListItemB.displayName = 'QuestionListItemB';

export default QuestionListItemB;
