import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {RouterProvider} from "react-router-dom";
import router from "./router";
import {Provider} from "react-redux";
import {configureAppStore} from "./store";
import {preloadAuth} from "./features/auth/auth-slice.ts";

(async () => {
    const preloadedAuth = await preloadAuth()
    const store = configureAppStore({
        auth: preloadedAuth
    })

    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <Provider store={store}>
                <RouterProvider router={router}/>
            </Provider>
        </React.StrictMode>,
    )
})()

