export {
    default as bookmarkReducer,
    setBookmarkList,
    addBookmarkOptimistic,
    removeBookmarkOptimistic,
    revertBookmarkOperation,
    confirmBookmarkOperation,
    setBookmarkLoading,
    setBookmarkInitialized,
    clearBookmarks,
    type BookmarkState
} from './bookmark.slice';
