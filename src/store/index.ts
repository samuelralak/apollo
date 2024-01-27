import {configureStore} from "@reduxjs/toolkit";
import authReducer, {AuthState} from "../features/auth/auth-slice"
import voteReducer from "../features/vote/vote-slice"
import answerReducer from "../features/answer/answer-slice"
import portalReducer from "../features/portal/portal-slice"
import questionReducer from "../features/question/question-slice.ts"
import commentReducer from "../features/comments/comment-slice.ts"
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
            portal: portalReducer,
            question: questionReducer,
            comment: commentReducer
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
