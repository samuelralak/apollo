import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PendingEventsState, SubscriptionContext } from "../../lib/subscriptions/types";
import { ResourceType } from "../../lib/subscriptions/types";

// Types
export interface SubscriptionState {
    pending: PendingEventsState;
}

interface AddPendingEventPayload {
    eventId: string;
    resourceType: ResourceType;
    context?: SubscriptionContext;
    timestamp?: number;
}

interface ClearPendingEventsPayload {
    resourceType: ResourceType;
    context?: SubscriptionContext;
}

type KeyedPendingBucket = Record<string, { ids: string[]; count: number }>;

// Initial state
const initialPendingState: PendingEventsState = {
    questions: { ids: [], count: 0, oldestTimestamp: null },
    answers: {},
    votes: {},
    comments: {}
};

const initialState: SubscriptionState = {
    pending: initialPendingState
};

// Helper: Add event to a keyed bucket (answers, votes, comments)
function addToKeyedBucket(bucket: KeyedPendingBucket, key: string, eventId: string): void {
    if (!bucket[key]) {
        bucket[key] = { ids: [], count: 0 };
    }
    if (!bucket[key].ids.includes(eventId)) {
        bucket[key].ids.push(eventId);
        bucket[key].count = bucket[key].ids.length;
    }
}

// Helper: Clear from a keyed bucket
function clearKeyedBucket(bucket: KeyedPendingBucket, key?: string): KeyedPendingBucket {
    if (key) {
        delete bucket[key];
        return bucket;
    }
    return {};
}

// Slice
const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        addPendingEvent: (state, { payload }: PayloadAction<AddPendingEventPayload>) => {
            const { eventId, resourceType, context, timestamp } = payload;
            const parentId = context?.parentId;

            switch (resourceType) {
                case ResourceType.QUESTION: {
                    const questions = state.pending.questions;
                    if (!questions.ids.includes(eventId)) {
                        questions.ids.push(eventId);
                        questions.count = questions.ids.length;

                        if (timestamp && (questions.oldestTimestamp === null || timestamp < questions.oldestTimestamp)) {
                            questions.oldestTimestamp = timestamp;
                        }
                    }
                    break;
                }
                case ResourceType.ANSWER:
                    if (parentId) addToKeyedBucket(state.pending.answers, parentId, eventId);
                    break;
                case ResourceType.VOTE:
                    if (parentId) addToKeyedBucket(state.pending.votes, parentId, eventId);
                    break;
                case ResourceType.COMMENT:
                    if (parentId) addToKeyedBucket(state.pending.comments, parentId, eventId);
                    break;
            }
        },

        clearPendingEvents: (state, { payload }: PayloadAction<ClearPendingEventsPayload>) => {
            const { resourceType, context } = payload;
            const parentId = context?.parentId;

            switch (resourceType) {
                case ResourceType.QUESTION:
                    state.pending.questions = { ids: [], count: 0, oldestTimestamp: null };
                    break;
                case ResourceType.ANSWER:
                    state.pending.answers = clearKeyedBucket(state.pending.answers, parentId);
                    break;
                case ResourceType.VOTE:
                    state.pending.votes = clearKeyedBucket(state.pending.votes, parentId);
                    break;
                case ResourceType.COMMENT:
                    state.pending.comments = clearKeyedBucket(state.pending.comments, parentId);
                    break;
            }
        },

        resetPendingState: (state) => {
            state.pending = initialPendingState;
        }
    }
});

export const { addPendingEvent, clearPendingEvents, resetPendingState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
