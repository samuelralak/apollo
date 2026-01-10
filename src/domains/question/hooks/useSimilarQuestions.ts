import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../app/store'
import type { Question } from '../types/question.types'

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what',
    'which', 'who', 'whom', 'how', 'when', 'where', 'why', 'if', 'then',
    'so', 'as', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'again', 'further', 'once'
])

const MIN_WORD_LENGTH = 3
const MAX_RESULTS = 5
const MIN_TITLE_LENGTH = 10 // Don't search until title has some content

/**
 * Tokenizes a string into meaningful keywords
 */
function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word =>
            word.length >= MIN_WORD_LENGTH &&
            !STOP_WORDS.has(word)
        )
}

/**
 * Calculate similarity score between two sets of keywords
 * Uses Jaccard similarity coefficient
 */
function calculateSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0

    const set1 = new Set(keywords1)
    const set2 = new Set(keywords2)

    const intersection = [...set1].filter(word => set2.has(word)).length
    const union = new Set([...set1, ...set2]).size

    return intersection / union
}

interface SimilarQuestion {
    question: Question
    score: number
}

interface UseSimilarQuestionsOptions {
    excludeId?: string
    minScore?: number
}

interface UseSimilarQuestionsReturn {
    similarQuestions: SimilarQuestion[]
    isSearching: boolean
}

/**
 * Hook to find similar questions based on title keywords
 */
const useSimilarQuestions = (
    title: string,
    options: UseSimilarQuestionsOptions = {}
): UseSimilarQuestionsReturn => {
    const { excludeId, minScore = 0.15 } = options
    const questions = useSelector((state: RootState) => state.question.data)

    const similarQuestions = useMemo(() => {
        // Don't search if title is too short
        if (!title || title.length < MIN_TITLE_LENGTH) {
            return []
        }

        const inputKeywords = tokenize(title)

        // Need at least 2 keywords to search
        if (inputKeywords.length < 2) {
            return []
        }

        const results: SimilarQuestion[] = []

        for (const question of Object.values(questions)) {
            // Skip excluded question (for editing)
            if (excludeId && question.id === excludeId) continue

            const questionKeywords = tokenize(question.title)
            const score = calculateSimilarity(inputKeywords, questionKeywords)

            if (score >= minScore) {
                results.push({ question, score })
            }
        }

        // Sort by score (highest first) and take top results
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_RESULTS)
    }, [title, questions, excludeId, minScore])

    // isSearching is true if we have enough input to search
    const isSearching = title.length >= MIN_TITLE_LENGTH && tokenize(title).length >= 2

    return {
        similarQuestions,
        isSearching
    }
}

export default useSimilarQuestions
