import { useContext, useState, useMemo, useCallback } from "react";
import { useDebouncedEffect, useUpdateEffect, useIsMounted } from "@react-hookz/web";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import questionSchema from "../schemas/question.schema";
import { NDKContext } from "../../../lib/ndk/NDKProvider";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { showToast } from "../../../shared/store/toast.slice";
import constants from "../../../constants";
import type { Question } from "../types/question.types";
import useQuestionDraft from "./useQuestionDraft";

export interface QuestionFormValues {
    title: string;
    description: string;
    category: string;
    tags: string[];
}

export interface FormProgress {
    category: boolean;
    title: boolean;
    description: boolean;
    tags: boolean;
    percentage: number;
}

export interface DraftStatus {
    hasDraft: boolean;
    lastSavedAt: number | null;
    isSaving: boolean;
}

const useQuestionForm = (question?: Question) => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const auth = useSelector((state: RootState) => state.auth)
    const questionId = question?.id ?? uuidv4()

    const { publishEvent, ndkInstance } = useContext(NDKContext) as NDKContext
    const [publishing, setPublishing] = useState<boolean>(false)
    const [invitedUsers, setInvitedUsers] = useState<NDKUser[]>([])
    const [draftStatus, setDraftStatus] = useState<DraftStatus>({
        hasDraft: false,
        lastSavedAt: null,
        isSaving: false
    })
    const isMounted = useIsMounted()

    // Draft management
    const draft = useQuestionDraft({
        questionId: question?.id,
        onDraftRestored: async (restoredDraft, invitedPubkeys) => {
            // Only restore if not editing an existing question
            if (!question && restoredDraft) {
                if (restoredDraft.title) form.setValue('title', restoredDraft.title)
                if (restoredDraft.description) form.setValue('description', restoredDraft.description)
                if (restoredDraft.category) form.setValue('category', restoredDraft.category)
                if (restoredDraft.tags) form.setValue('tags', restoredDraft.tags)

                // Restore invited users from pubkeys
                if (invitedPubkeys && invitedPubkeys.length > 0) {
                    const ndk = ndkInstance()
                    const users = invitedPubkeys.map(pubkey => ndk.getUser({ pubkey }))
                    setInvitedUsers(users)
                }

                dispatch(showToast({
                    title: 'Draft restored',
                    subtitle: 'Your previous draft has been loaded.',
                    type: 'success'
                }))
            }
        }
    })

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            description: question?.description ?? '',
            tags: question?.tags ?? [],
            category: question?.category ?? '',
            title: question?.title ?? ''
        },
        mode: 'onChange' // Enable real-time validation
    })

    // Watch all form values for progress tracking and draft saving
    const watchedValues = form.watch()

    // Calculate form progress
    const progress = useMemo<FormProgress>(() => {
        const category = !!watchedValues.category && watchedValues.category.length > 0
        const title = !!watchedValues.title && watchedValues.title.length >= 1
        const description = !!watchedValues.description && watchedValues.description.length >= 50
        const tags = !!watchedValues.tags && watchedValues.tags.length >= 1

        const completed = [category, title, description, tags].filter(Boolean).length
        const percentage = Math.round((completed / 4) * 100)

        return { category, title, description, tags, percentage }
    }, [watchedValues.category, watchedValues.title, watchedValues.description, watchedValues.tags])

    // Track when form values change to show "saving" indicator
    useUpdateEffect(() => {
        if (question) return // Don't auto-save when editing existing question

        const hasContent = watchedValues.title || watchedValues.description ||
            watchedValues.category || (watchedValues.tags && watchedValues.tags.length > 0)

        if (hasContent && isMounted()) {
            setDraftStatus(prev => ({ ...prev, isSaving: true }))
        }
    }, [watchedValues.title, watchedValues.description, watchedValues.category, watchedValues.tags])

    // Auto-save draft with debounce (only for new questions)
    useDebouncedEffect(
        () => {
            if (question) return // Don't auto-save when editing existing question

            const hasContent = watchedValues.title || watchedValues.description ||
                watchedValues.category || (watchedValues.tags && watchedValues.tags.length > 0) ||
                invitedUsers.length > 0

            if (hasContent) {
                const invitedPubkeys = invitedUsers.map(u => u.pubkey)
                draft.saveDraft(watchedValues, invitedPubkeys)

                if (isMounted()) {
                    setDraftStatus({
                        hasDraft: true,
                        lastSavedAt: Date.now(),
                        isSaving: false
                    })
                }
            }
        },
        [watchedValues.title, watchedValues.description, watchedValues.category, watchedValues.tags, invitedUsers, question, draft],
        2000 // 2 second debounce
    )

    const inviteUser = useCallback((user: NDKUser) => {
        if (!invitedUsers.find(u => u.pubkey === user.pubkey)) {
            setInvitedUsers(prev => [...prev, user])
        }
    }, [invitedUsers])

    const removeInvitedUser = useCallback((pubkey: string) => {
        setInvitedUsers(prev => prev.filter(u => u.pubkey !== pubkey))
    }, [])

    const onSubmit: SubmitHandler<QuestionFormValues> = async (data) => {
        setPublishing(true)

        try {
            const payload = { ...data, id: questionId } as Question
            let content = payload.description

            // Part 2: Add NIP-27 mentions to content for interoperability
            if (invitedUsers.length > 0) {
                const mentions = invitedUsers
                    .map(u => `nostr:${nip19.npubEncode(u.pubkey)}`)
                    .join(' ')
                content += `\n\n**Invited:** ${mentions}`
            }

            await publishEvent(constants.questionKind, content, [
                ["d", payload.id!],
                ["title", payload.title],
                ["L", "category"],
                ["l", payload.category, "category"],
                ...payload.tags.map((tag) => ["t", tag]),
                ...invitedUsers.map((user) => ["p", user.pubkey])  // Standard p tags (no "mention" marker)
            ])

            // Part 1: Publish kind 1 invite notes for cross-client visibility
            if (invitedUsers.length > 0 && auth.pubkey) {
                const questionNaddr = nip19.naddrEncode({
                    kind: constants.questionKind as number,
                    pubkey: auth.pubkey,
                    identifier: questionId
                })

                // Publish invite note for each user
                for (const user of invitedUsers) {
                    try {
                        await publishEvent(constants.noteKind,
                            `I invited you to answer my question on Apollo:\n\nnostr:${questionNaddr}`,
                            [
                                ["p", user.pubkey],
                                ["a", `${constants.questionKind}:${auth.pubkey}:${questionId}`],
                                ["client", "Apollo"]
                            ]
                        )
                    } catch (inviteError) {
                        // Don't fail the whole submission if invite note fails
                        console.warn('Failed to publish invite note:', inviteError)
                    }
                }
            }

            // Clear draft on successful publish
            draft.clearDraft()

            setPublishing(false)
            dispatch(showToast({
                title: 'Success',
                subtitle: 'Your question has been successfully published.',
                type: 'success'
            }))
            navigate(`/questions/${questionId}`)
        } catch (error) {
            setPublishing(false)
            dispatch(showToast({
                title: 'Error',
                subtitle: error instanceof Error ? error.message : 'Failed to publish question. Please try again.',
                type: 'error'
            }))
        }
    }

    const clearFormDraft = useCallback(() => {
        draft.clearDraft()
        setDraftStatus({
            hasDraft: false,
            lastSavedAt: null,
            isSaving: false
        })
    }, [draft])

    return {
        form,
        onSubmit,
        publishing,
        invitedUsers,
        inviteUser,
        removeInvitedUser,
        progress,
        draftStatus,
        clearDraft: clearFormDraft
    }
}

export default useQuestionForm
