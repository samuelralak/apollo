import ResourceConfig from "./config.ts";

interface ResourceState<T> {
    data: { [key: string]: T };
    total: number;
    config: ResourceConfig;
}

const createResourceState = <T>(config: ResourceConfig = {}): ResourceState<T> => {
    return {
        data: {},
        total: 0,
        config,
    };
}


export { type ResourceState }
export default createResourceState
