import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {RouterProvider} from "react-router";
import router from "./router";
import {Provider} from "react-redux";
import {configureAppStore} from "./app/store";
import {preloadAuth} from "./domains/auth/store/auth.slice";

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

