// Re-export from new locations for backwards compatibility
// TODO: Update imports to use @/domains/question directly and remove this file
export type { Question } from '../domains/question/types/question.types';
export type { Question as default } from '../domains/question/types/question.types';
export { transformer, questionTransformer } from '../domains/question/services/question.transformer';
