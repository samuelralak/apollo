import { Dialog, DialogPanel, DialogBackdrop, DialogTitle } from "@headlessui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, AlertCircleIcon } from "@hugeicons-pro/core-solid-rounded";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { AppDispatch, RootState } from "../../../app/store";
import { hidePortal } from "../../store/portal.slice";
import { classNames } from "../../../utils";
import useQuestionForm from "../../../domains/question/hooks/useQuestionForm";
import {
    CategorySection,
    TitleInput,
    DetailsSection,
    TagsInput,
    InvitesSection,
    SimilarQuestions,
    ProgressIndicator,
    GuidelinesPanel
} from "../../../domains/question/components/form";
import { questionTransformer } from "../../../domains/question/services/question.transformer";
import { addQuestion } from "../../../domains/question/store/question.slice";
import useNDKSubscription, { ResourceType } from "../../hooks/useNDKSubscription";
import constants from "../../../constants";

const QuestionPortal = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { visible, questionId } = useSelector((state: RootState) => state.portal);
    const existingQuestion = useSelector((state: RootState) =>
        questionId ? state.question.data[questionId] : undefined
    );
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    const isEditMode = !!questionId;

    // Fetch question if editing and not in store
    const handleQuestionEvent = useCallback((event: NDKEvent) => {
        const questionFromEvent = questionTransformer(event);
        if (event.id !== existingQuestion?.eventId) {
            dispatch(addQuestion(questionFromEvent));
        }
    }, [dispatch, existingQuestion?.eventId]);

    const filters = useMemo(() => ({
        kinds: [constants.questionKind],
        "#d": [questionId || ""]
    }), [questionId]);

    useNDKSubscription(
        filters,
        handleQuestionEvent,
        undefined,
        { resourceType: ResourceType.QUESTION, enabled: isEditMode && visible }
    );

    const question = isEditMode ? existingQuestion : undefined;

    const handleSuccess = useCallback(() => {
        dispatch(hidePortal());
    }, [dispatch]);

    const {
        form,
        onSubmit,
        publishing,
        invitedUsers,
        inviteUser,
        removeInvitedUser,
        progress,
        draftStatus
    } = useQuestionForm(question, handleSuccess);

    const category = form.watch('category');
    const title = form.watch('title');
    const description = form.watch('description');
    const tags = form.watch('tags');

    // Check if form has unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        if (isEditMode && question) {
            const tagsChanged = tags?.length !== question.tags?.length ||
                tags?.some((t, i) => t !== question.tags?.[i]);
            return (
                title !== question.title ||
                description !== question.description ||
                category !== question.category ||
                tagsChanged
            );
        }
        return !!(title || description || category || (tags && tags.length > 0));
    }, [isEditMode, question, title, description, category, tags]);

    const handleClose = useCallback(() => {
        if (hasUnsavedChanges && !publishing) {
            setShowCloseConfirm(true);
        } else {
            dispatch(hidePortal());
        }
    }, [hasUnsavedChanges, publishing, dispatch]);

    const confirmClose = useCallback(() => {
        setShowCloseConfirm(false);
        dispatch(hidePortal());
    }, [dispatch]);

    const cancelClose = useCallback(() => {
        setShowCloseConfirm(false);
    }, []);

    // Reset confirm dialog when portal closes
    useEffect(() => {
        if (!visible) {
            setShowCloseConfirm(false);
        }
    }, [visible]);

    // Show loading state for edit mode while fetching
    if (isEditMode && !question) {
        return (
            <Dialog open={visible} onClose={handleClose} className="relative z-50">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-200 data-closed:opacity-0"
                />
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <DialogPanel className="bg-white dark:bg-slate-900 rounded-2xl p-8">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 border-2 border-slate-200 dark:border-slate-700 border-t-teal-500 rounded-full animate-spin" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Loading question...</span>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog open={visible} onClose={handleClose} className="relative z-50">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-slate-950/80 transition-opacity duration-200 data-closed:opacity-0"
                />

                <div className="fixed inset-0 z-50">
                    <DialogPanel
                        transition
                        className={classNames(
                            "h-full w-full bg-white dark:bg-slate-900 overflow-hidden",
                            "transition-all duration-200 ease-out",
                            "data-closed:opacity-0 data-closed:scale-[0.98]",
                            "flex flex-col"
                        )}
                    >
                        {/* Fixed Header */}
                        <header className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {isEditMode ? 'Edit question' : 'Ask a public question'}
                                </DialogTitle>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={publishing}
                                        className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={form.handleSubmit(onSubmit)}
                                        disabled={publishing}
                                        className={classNames(
                                            "hidden sm:block px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors",
                                            "bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400",
                                            "disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                                        )}
                                    >
                                        {publishing ? 'Publishing...' : isEditMode ? 'Save changes' : 'Publish'}
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        disabled={publishing}
                                        className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                                    >
                                        <HugeiconsIcon icon={Cancel01Icon} size={20} />
                                    </button>
                                </div>
                            </div>
                        </header>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                                    {/* Mobile: Progress indicator at top */}
                                    {!isEditMode && (
                                        <div className="lg:hidden">
                                            <ProgressIndicator progress={progress} draftStatus={draftStatus} />
                                        </div>
                                    )}

                                    {/* Main form column */}
                                    <div className="space-y-5 sm:space-y-6 lg:col-span-2">
                                        <CategorySection form={form} defaultCategory={question?.category} />
                                        <TitleInput form={form} category={category} defaultTitle={question?.title} />
                                        <SimilarQuestions title={title} excludeId={question?.id} />
                                        <DetailsSection form={form} />
                                        <InvitesSection
                                            invitedUsers={invitedUsers}
                                            onInvite={inviteUser}
                                            onRemove={removeInvitedUser}
                                        />
                                        <TagsInput form={form} />

                                        {/* Mobile: Guidelines at bottom */}
                                        <div className="lg:hidden">
                                            <GuidelinesPanel category={category} />
                                        </div>

                                        {/* Footer actions */}
                                        <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                                            {/* Draft status */}
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {!isEditMode && draftStatus.hasDraft && (
                                                    draftStatus.isSaving ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="h-3 w-3 border-2 border-slate-300 dark:border-slate-600 border-t-teal-500 dark:border-t-teal-400 rounded-full animate-spin" />
                                                            Saving draft...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5">
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                            </svg>
                                                            Draft saved
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleClose}
                                                    disabled={publishing}
                                                    className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    onClick={form.handleSubmit(onSubmit)}
                                                    disabled={publishing}
                                                    className={classNames(
                                                        "px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors",
                                                        "bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400",
                                                        "disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                                                    )}
                                                >
                                                    {publishing ? 'Publishing...' : isEditMode ? 'Save changes' : 'Publish'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop sidebar */}
                                    <div className="hidden lg:block lg:col-span-1 space-y-6">
                                        {/* Progress indicator (new questions only) */}
                                        {!isEditMode && (
                                            <ProgressIndicator progress={progress} draftStatus={draftStatus} />
                                        )}
                                        {/* Guidelines */}
                                        <GuidelinesPanel category={category} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Close Confirmation Dialog */}
            <Dialog open={showCloseConfirm} onClose={cancelClose} className="relative z-[60]">
                <DialogBackdrop className="fixed inset-0 bg-slate-950/50" />
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                <HugeiconsIcon icon={AlertCircleIcon} size={20} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    Discard changes?
                                </DialogTitle>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    You have unsaved changes. Are you sure you want to close?
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={cancelClose}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                            >
                                Keep editing
                            </button>
                            <button
                                onClick={confirmClose}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Discard
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
};

export default QuestionPortal;
