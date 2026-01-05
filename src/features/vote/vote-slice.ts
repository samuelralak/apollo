// Re-export from new location for backwards compatibility
// TODO: Update imports to use @/domains/vote directly and remove this file
export { updateVote, type VoteState } from '../../domains/vote/store/vote.slice';
export { default } from '../../domains/vote/store/vote.slice';
