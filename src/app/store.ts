import {configureStore} from "@reduxjs/toolkit";
import authReducer from "../domains/auth/store/auth.slice";
import { type AuthState } from "../domains/auth/store/auth.slice";
import voteReducer from "../domains/vote/store/vote.slice";
import answerReducer from "../domains/answer/store/answer.slice";
import portalReducer from "../shared/store/portal.slice";
import questionReducer from "../domains/question/store/question.slice";
import commentReducer from "../domains/comment/store/comment.slice";
import {authListenerMiddleware} from "../domains/auth/store/auth.middleware";

export interface PreloadedState {
    auth: AuthState
}

export const configureAppStore = (preloadedState: PreloadedState) => {
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
