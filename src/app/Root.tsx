import MainNavigation from "../shared/components/layout/MainNavigation";
import {Outlet} from "react-router";
import NDKProvider from "../lib/ndk/NDKProvider";
import ToastRenderer from "../shared/components/feedback/ToastRenderer";
import {HelmetProvider} from "react-helmet-async";
import ZapPortal from "../shared/components/portal/ZapPortal";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "./store";
import {hidePortal, PortalID, showPortal} from "../shared/store/portal.slice";
import {createPortal} from "react-dom";
import SharePortal from "../shared/components/portal/SharePortal";
import GetStartedPortal from "../shared/components/portal/GetStartedPortal";
import MobileMenuPortal from "../shared/components/portal/MobileMenuPortal";
import WelcomePortal from "../shared/components/portal/WelcomePortal";
import useFirstVisit from "../shared/hooks/useFirstVisit";
import {useMountEffect} from "@react-hookz/web";

const Root = () => {
    const dispatch = useDispatch<AppDispatch>()
    const isLoggedIn = useSelector((state: RootState) => state.auth).isLoggedIn
    const {visible, portalId, eventCoordinate, ...portal} = useSelector((state: RootState) => state.portal)
    const {isFirstVisit, markWelcomeSeen} = useFirstVisit()
    const helmetContext = {}

    useMountEffect(() => {
        if (isFirstVisit) {
            dispatch(showPortal({portalId: PortalID.welcome}))
        }
    })

    return (
        <HelmetProvider context={helmetContext}>
            <NDKProvider>
                <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors">
                    <MainNavigation/>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet/>
                    </div>
                </div>
                {isLoggedIn && (visible && portalId === PortalID.zap) && createPortal(
                    <ZapPortal
                        pubkey={portal.pubkey!}
                        eventId={portal.eventId}
                        eventCoordinate={eventCoordinate}
                    />, document.body
                )}

                {visible && portalId === PortalID.share && createPortal(
                    <SharePortal visible={visible}
                                 eventCoordinate={eventCoordinate!}
                                 eventId={portal.eventId!}/>
                    , document.body
                )}

                {!isLoggedIn && visible && portalId === PortalID.auth && createPortal(
                    <GetStartedPortal />, document.body
                )}

                {visible && portalId === PortalID.mobileMenu && createPortal(
                    <MobileMenuPortal />, document.body
                )}

                {visible && portalId === PortalID.welcome && createPortal(
                    <WelcomePortal
                        visible={visible}
                        onClose={() => {
                            markWelcomeSeen()
                            dispatch(hidePortal())
                        }}
                    />, document.body
                )}

                <ToastRenderer />
            </NDKProvider>
        </HelmetProvider>
    )
}

export default Root
