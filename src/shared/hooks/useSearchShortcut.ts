import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEventListener } from "@react-hookz/web";
import { AppDispatch, RootState } from "../../app/store";
import { hidePortal, PortalID, showPortal } from "../store/portal.slice";

/**
 * Global keyboard shortcut hook for search (Cmd+K / Ctrl+K)
 * Toggles the search portal open/closed
 */
const useSearchShortcut = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { visible, portalId } = useSelector((state: RootState) => state.portal);
    const isSearchOpen = visible && portalId === PortalID.search;

    const toggleSearch = useCallback(() => {
        if (isSearchOpen) {
            dispatch(hidePortal());
        } else {
            dispatch(showPortal({ portalId: PortalID.search }));
        }
    }, [dispatch, isSearchOpen]);

    useEventListener(
        typeof document !== 'undefined' ? document : null,
        'keydown',
        (event: KeyboardEvent) => {
            // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                toggleSearch();
            }
        }
    );
};

export default useSearchShortcut;
