import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {RouterProvider} from "react-router";
import router from "./app/router";
import {Provider} from "react-redux";
import {configureAppStore} from "./app/store";
import {preloadAuth} from "./domains/auth/store/auth.slice";
import {ThemeProvider} from "./shared/theme";

(async () => {
    const preloadedAuth = await preloadAuth()
    const store = configureAppStore({
        auth: preloadedAuth
    })

    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <Provider store={store}>
                <ThemeProvider>
                    <RouterProvider router={router}/>
                </ThemeProvider>
            </Provider>
        </React.StrictMode>,
    )
})()

