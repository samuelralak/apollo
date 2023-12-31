import {configureStore} from "@reduxjs/toolkit";
import authReducer, {AuthState} from "../features/auth/auth-slice"
import voteReducer from "../features/vote/vote-slice"
import answerReducer from "../features/answer/answer-slice"
import portalReducer from "../features/portal/portal-slice"
import {authListenerMiddleware} from "./middlewares";

interface PreloadedState {
    auth: AuthState
}

const configureAppStore = (preloadedState: PreloadedState) => {
    return configureStore({
        preloadedState,
        reducer: {
            auth: authReducer,
            vote: voteReducer,
            answer: answerReducer,
            portal: portalReducer
        },
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: ['persist/PERSIST'],
                }
            }).concat([authListenerMiddleware.middleware]),
    })
}


export type RootState = ReturnType<ReturnType<typeof configureAppStore>['getState']>
export type AppDispatch = ReturnType<typeof configureAppStore>['dispatch']

export {
    type PreloadedState,
    configureAppStore
}
