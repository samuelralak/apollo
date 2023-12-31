import HomePage from './home'
import {EditQuestionPage, NewQuestionPage, QuestionPage} from "./questions";

import MainNavigation from "../components/MainNavigation.tsx";
import {Outlet} from "react-router-dom";
import NDKProvider from "../components/NDKProvider.tsx";
import ToastProvider from "../components/ToastProvider.tsx";
import {HelmetProvider} from "react-helmet-async";

const Root = () => {
    const helmetContext = {}

    return (
        <HelmetProvider context={helmetContext}>
            <ToastProvider>
                <NDKProvider>
                    <MainNavigation/>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet/>
                    </div>
                </NDKProvider>
            </ToastProvider>
        </HelmetProvider>
    )
}

export {HomePage, QuestionPage, NewQuestionPage, EditQuestionPage}

export default Root
