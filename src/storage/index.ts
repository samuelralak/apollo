import * as localforage from "localforage";

const storeNames: { SESSION: string } = {
    SESSION: 'session'
}

type StoreName = typeof storeNames[keyof typeof storeNames];

const storage = localforage.createInstance({
    name: import.meta.env.VITE_SECURE_LOCAL_STORAGE_PREFIX as string
})

const saveToStorage = <T>(storeName: StoreName, key: string, value: T) => {
    storage.config({storeName})
    return storage.setItem(key, value)
}

const fetchFromStorage = (storeName: StoreName, key: string) => {
    storage.config({storeName})
    return storage.getItem(key)
}

const deleteFromStorage = (storeName: StoreName, key: string) => {
    storage.config({storeName})
    return storage.removeItem(key)
}

export {
    storeNames,
    saveToStorage,
    fetchFromStorage,
    deleteFromStorage
}

export default storage
