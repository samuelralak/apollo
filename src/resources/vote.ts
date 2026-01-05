// Re-export from new locations for backwards compatibility
// TODO: Update imports to use @/domains/vote directly and remove this file
export type { Vote } from '../domains/vote/types/vote.types';
export { VoteType } from '../domains/vote/types/vote.types';
export type { Vote as default } from '../domains/vote/types/vote.types';
export { transformer, voteTransformer } from '../domains/vote/services/vote.transformer';
