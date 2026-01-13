import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
    label: string;
    href: string;
}

interface ToastState {
    visible: boolean;
    title: string;
    subtitle?: string;
    type: ToastType;
    action?: ToastAction;
}

const initialState: ToastState = {
    visible: false,
    title: '',
    type: 'info'
};

const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        showToast: (state, {payload}: PayloadAction<Omit<ToastState, 'visible'>>) => {
            state.visible = true;
            state.title = payload.title;
            state.subtitle = payload.subtitle;
            state.type = payload.type ?? 'info';
            state.action = payload.action;
        },
        dismissToast: (state) => {
            state.visible = false;
            state.action = undefined;
        }
    }
});

export const {showToast, dismissToast} = toastSlice.actions;
export default toastSlice.reducer;
