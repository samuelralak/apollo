// Re-export from new location for backwards compatibility
// TODO: Update imports to use @lib/storage directly and remove this file
export {
    storeNames,
    saveToStorage,
    fetchFromStorage,
    deleteFromStorage
} from '../lib/storage';

export { default } from '../lib/storage';
