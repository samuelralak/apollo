import HomePage from './home'
import {NewQuestionPage, QuestionPage} from "./questions";

import MainNavigation from "../components/MainNavigation.tsx";
import {Outlet} from "react-router-dom";
import NDKProvider from "../components/NDKProvider.tsx";
import ToastProvider from "../components/ToastProvider.tsx";

const Root = () => (
    <ToastProvider>
        <NDKProvider>
            <MainNavigation/>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <Outlet/>
            </div>
        </NDKProvider>
    </ToastProvider>
)

export {HomePage, QuestionPage, NewQuestionPage}

export default Root
