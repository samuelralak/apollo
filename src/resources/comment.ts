// Re-export from new locations for backwards compatibility
// TODO: Update imports to use @/domains/comment directly and remove this file
export type { Comment } from '../domains/comment/types/comment.types';
export type { Comment as default } from '../domains/comment/types/comment.types';
export { transformer, commentTransformer } from '../domains/comment/services/comment.transformer';
