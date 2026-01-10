import { useCallback, useRef } from 'react'
import { useIsMounted, useMountEffect } from '@react-hookz/web'
import type { QuestionFormValues } from './useQuestionForm'

const DRAFT_STORAGE_KEY = 'apollo_question_draft'

interface DraftState {
    values: Partial<QuestionFormValues>
    savedAt: number
    questionId?: string
}

interface UseQuestionDraftOptions {
    questionId?: string
    onDraftRestored?: (draft: Partial<QuestionFormValues>) => void
}

interface UseQuestionDraftReturn {
    saveDraft: (values: Partial<QuestionFormValues>) => void
    loadDraft: () => Partial<QuestionFormValues> | null
    clearDraft: () => void
    hasDraft: () => boolean
    lastSavedAt: number | null
}

/**
 * Hook for managing question drafts with localStorage persistence.
 *
 * Future enhancement: NIP-37 Nostr draft sync when user is logged in.
 * NIP-37 uses kind 31234 with NIP-44 encryption to user's pubkey.
 */
const useQuestionDraft = (options: UseQuestionDraftOptions = {}): UseQuestionDraftReturn => {
    const { questionId, onDraftRestored } = options
    const isMounted = useIsMounted()
    const lastSavedAtRef = useRef<number | null>(null)

    // Generate storage key (different key for editing vs new questions)
    const getStorageKey = useCallback(() => {
        return questionId ? `${DRAFT_STORAGE_KEY}_${questionId}` : DRAFT_STORAGE_KEY
    }, [questionId])

    // Save draft to localStorage (immediate - debouncing handled by caller)
    const saveDraft = useCallback((values: Partial<QuestionFormValues>) => {
        try {
            const draft: DraftState = {
                values,
                savedAt: Date.now(),
                questionId
            }
            localStorage.setItem(getStorageKey(), JSON.stringify(draft))
            if (isMounted()) {
                lastSavedAtRef.current = draft.savedAt
            }
        } catch (error) {
            console.error('Failed to save draft:', error)
        }
    }, [getStorageKey, questionId, isMounted])

    // Load draft from localStorage
    const loadDraft = useCallback((): Partial<QuestionFormValues> | null => {
        try {
            const stored = localStorage.getItem(getStorageKey())
            if (!stored) return null

            const draft: DraftState = JSON.parse(stored)

            // Check if draft is for the same question (or both are new)
            if (draft.questionId !== questionId) return null

            // Check if draft is not too old (7 days max)
            const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
            if (Date.now() - draft.savedAt > maxAge) {
                localStorage.removeItem(getStorageKey())
                return null
            }

            lastSavedAtRef.current = draft.savedAt
            return draft.values
        } catch (error) {
            console.error('Failed to load draft:', error)
            return null
        }
    }, [getStorageKey, questionId])

    // Clear draft from localStorage
    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(getStorageKey())
            lastSavedAtRef.current = null
        } catch (error) {
            console.error('Failed to clear draft:', error)
        }
    }, [getStorageKey])

    // Check if draft exists
    const hasDraft = useCallback((): boolean => {
        try {
            const stored = localStorage.getItem(getStorageKey())
            if (!stored) return false

            const draft: DraftState = JSON.parse(stored)
            return draft.questionId === questionId
        } catch {
            return false
        }
    }, [getStorageKey, questionId])

    // Restore draft on mount
    useMountEffect(() => {
        const draft = loadDraft()
        if (draft && onDraftRestored) {
            onDraftRestored(draft)
        }
    })

    return {
        saveDraft,
        loadDraft,
        clearDraft,
        hasDraft,
        lastSavedAt: lastSavedAtRef.current
    }
}

export default useQuestionDraft
