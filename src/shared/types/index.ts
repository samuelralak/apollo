// Shared types used across multiple domains
export type { User, BaseResource } from './user.types';
export type { Category, Guideline } from './category.types';

// Store types (re-exported from app for convenience)
export type { RootState, AppDispatch, PreloadedState } from '../../app/store';
