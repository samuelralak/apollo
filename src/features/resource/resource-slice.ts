import ResourceConfig from "./config.ts";
import {CaseReducer, createSlice, Draft, PayloadAction} from "@reduxjs/toolkit";
import createResourceState, {ResourceState} from "./state.ts";
import BaseResource from "../../resources/base.ts";

interface ActiveState<T> {
    [key: string]: ResourceState<T>;
}

type AddItemReducer<T> = CaseReducer<ActiveState<T>, PayloadAction<{ key: string, item: T }>>

const createResourceSlice = <T extends BaseResource>(name: string, config: ResourceConfig = {}) => {
    return createSlice({
        name,
        initialState: {} as ActiveState<T>,
        reducers: {
            addItem: <AddItemReducer<T>>((state, {payload: {key, item}}) => {
                const parentKey = item?.parentId

                if (!parentKey) {
                    return state
                }

                if (!state[parentKey]) {
                    state[parentKey] = createResourceState(config)
                }

                state[parentKey].data[key] = <Draft<T>>item
                state[parentKey].total = Object.keys(state[parentKey].data).length
            })
        }
    })
}

export default createResourceSlice
