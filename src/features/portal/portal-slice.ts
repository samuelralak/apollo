import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export enum PortalID {
    share = 'share',
    zap = 'zap'
}

interface PortalState {
    portalId?: PortalID;
    visible: boolean;
    pubkey?: string;
    eventId?: string;
    eventCoordinate?: string;
    content?: string;
}

const initialState: PortalState = {
    visible: false
}

const portalSlice = createSlice({
    name: 'portal',
    initialState,
    reducers: {
        showPortal: (state, {payload}: PayloadAction<Omit<PortalState, 'visible'>>) => {
            return {...state, ...payload, visible: true}
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        hidePortal: (_state) => initialState
    }
})

export const {showPortal, hidePortal} = portalSlice.actions
export {
    type PortalState
}

export default portalSlice.reducer
