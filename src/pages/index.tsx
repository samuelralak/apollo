import HomePage from './home'
import {EditQuestionPage, NewQuestionPage, QuestionPage} from "./questions";

import MainNavigation from "../components/MainNavigation.tsx";
import {Outlet} from "react-router-dom";
import NDKProvider from "../components/NDKProvider.tsx";
import ToastProvider from "../components/ToastProvider.tsx";
import {HelmetProvider} from "react-helmet-async";
import ZapPortal from "../components/portals/ZapPortal.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../store";
import {PortalID} from "../features/portal/portal-slice.ts";

const Root = () => {
    const isLoggedIn = useSelector((state: RootState) => state.auth).isLoggedIn
    const {visible, portalId, ...portal} = useSelector((state: RootState) => state.portal)
    const helmetContext = {}

    return (
        <HelmetProvider context={helmetContext}>
            <ToastProvider>
                <NDKProvider>
                    <MainNavigation/>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet/>
                    </div>
                    {isLoggedIn && (visible && portalId === PortalID.zap) && (
                        <ZapPortal
                            pubkey={portal.pubkey!}
                            eventId={portal.eventId}
                            eventCoordinate={portal.eventCoordinate}
                        />
                    )}
                </NDKProvider>
            </ToastProvider>
        </HelmetProvider>
    )
}

export {HomePage, QuestionPage, NewQuestionPage, EditQuestionPage}

export default Root
