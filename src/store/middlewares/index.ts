import {createListenerMiddleware, isAnyOf} from "@reduxjs/toolkit";
import {AuthState, signIn, signOut} from "../../features/auth/auth-slice.ts";
import {RootState} from "../index.ts";
import {deleteFromStorage, fetchFromStorage, saveToStorage, storeNames} from "../../storage";
import secureLocalStorage from "react-secure-storage";
import constants from "../../constants";

export const authListenerMiddleware = createListenerMiddleware()

authListenerMiddleware.startListening({
    matcher: isAnyOf(signIn, signOut),
    effect: async (action, listenerApi) => {
        const fromStorage = await fetchFromStorage(storeNames.SESSION, 'auth') as AuthState

        if (action.type === signIn.type) {
            const {auth} = listenerApi.getState() as RootState
            await saveToStorage(storeNames.SESSION, 'auth', {...(fromStorage ?? {}), ...auth})
        }

        if (action.type === signOut.type) {
            await deleteFromStorage(storeNames.SESSION, 'auth')
            secureLocalStorage.removeItem(constants.secureStorageKey)
        }
    },
})
