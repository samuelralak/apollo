// Re-export from new locations for backwards compatibility
// TODO: Update imports to use @/domains/answer directly and remove this file
export type { Answer } from '../domains/answer/types/answer.types';
export { transformer, answerTransformer } from '../domains/answer/services/answer.transformer';
