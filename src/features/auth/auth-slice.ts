// Re-export from new location for backwards compatibility
// TODO: Update imports to use @/domains/auth directly and remove this file
export { signIn, signOut, preloadAuth, SignerMethod, type AuthState } from '../../domains/auth/store/auth.slice';
export { default } from '../../domains/auth/store/auth.slice';
