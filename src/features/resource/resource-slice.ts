import ResourceConfig from "./config.ts";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import createResourceState, {ResourceState} from "./state.ts";
import BaseResource from "../../resources/base.ts";

interface ActiveState<T> {
    [key: string]: ResourceState<T>;
}

const createResourceSlice = <T extends BaseResource>(name: string, config: ResourceConfig = {}) => {
    return createSlice({
        name,
        initialState: {} as ActiveState<T>,
        reducers: {
            addItem: (state, {payload: {key, item}}: PayloadAction<{ key: string, item: T }>) => {
                const parentKey = item?.parentId

                if (!parentKey) {
                    return
                }

                if (!state[parentKey]) {
                    state[parentKey] = createResourceState(config) as typeof state[typeof parentKey]
                }

                // @ts-expect-error - Immer Draft type complexity with generics
                state[parentKey].data[key] = item
                state[parentKey].total = Object.keys(state[parentKey].data).length
            }
        }
    })
}

export default createResourceSlice
