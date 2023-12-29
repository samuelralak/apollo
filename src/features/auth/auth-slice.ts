import {NDKUserProfile} from "@nostr-dev-kit/ndk";
import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import {fetchFromStorage, storeNames} from "../../storage";

enum SignerMethod {
    NIP07 = 'nip-07',
    PRIVATE_KEY = 'privateKey'
}

interface AuthState {
    isLoggedIn: boolean;
    userProfile: NDKUserProfile | undefined;
    signerMethod: SignerMethod | undefined;
}

const initialState: AuthState = {
    isLoggedIn: false,
    userProfile: undefined,
    signerMethod: undefined
}

const preloadAuth = async (): Promise<AuthState> => {
    const session = await fetchFromStorage(storeNames.SESSION, 'auth') as AuthState
    return {...initialState, ...(session ?? {})}
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        signIn: (state, {payload}: PayloadAction<{ userProfile: NDKUserProfile, signerMethod: SignerMethod }>) => {
            state.isLoggedIn = true
            state.userProfile = payload.userProfile
            state.signerMethod = payload.signerMethod
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        signOut: (_state) => initialState
    }
})

export const {signIn, signOut} = authSlice.actions

export {
    preloadAuth,
    SignerMethod,
    type AuthState
}

export default authSlice.reducer
