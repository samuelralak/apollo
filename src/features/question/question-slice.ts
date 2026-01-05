// Re-export from new location for backwards compatibility
// TODO: Update imports to use @/domains/question directly and remove this file
export { addQuestion, updateLastFetched, type QuestionState } from '../../domains/question/store/question.slice';
export { default } from '../../domains/question/store/question.slice';
