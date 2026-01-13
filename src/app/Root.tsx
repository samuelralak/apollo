import Sidebar from "../shared/components/layout/Sidebar";
import RightSidebar from "../shared/components/layout/RightSidebar";
import BottomTabBar from "../shared/components/layout/BottomTabBar";
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
import SearchPortal from "../shared/components/portal/SearchPortal";
import QuestionPortal from "../shared/components/portal/QuestionPortal";
import useFirstVisit from "../shared/hooks/useFirstVisit";
import useSearchShortcut from "../shared/hooks/useSearchShortcut";
import {useMountEffect} from "@react-hookz/web";

const Root = () => {
    const dispatch = useDispatch<AppDispatch>()
    const isLoggedIn = useSelector((state: RootState) => state.auth).isLoggedIn
    const {visible, portalId, eventCoordinate, ...portal} = useSelector((state: RootState) => state.portal)
    const {isFirstVisit, markWelcomeSeen} = useFirstVisit()
    const helmetContext = {}

    useSearchShortcut()

    useMountEffect(() => {
        if (isFirstVisit) {
            dispatch(showPortal({portalId: PortalID.welcome}))
        }
    })

    return (
        <HelmetProvider context={helmetContext}>
            <NDKProvider>
                <div className="min-h-screen bg-white dark:bg-slate-950">
                    {/* Centered container */}
                    <div className="mx-auto max-w-[1400px] flex justify-center">
                        {/* Left Sidebar - hidden on mobile */}
                        <Sidebar className="hidden md:flex" />

                        {/* Main content area */}
                        <main className="flex-1 min-h-screen max-w-[600px] border-x border-slate-200 dark:border-slate-800">
                            <div className="px-4 py-6 pb-20 md:pb-6">
                                <Outlet />
                            </div>
                        </main>

                        {/* Right Sidebar - hidden below xl */}
                        <RightSidebar className="hidden xl:flex" />
                    </div>

                    {/* Mobile bottom tab bar */}
                    <BottomTabBar className="md:hidden" />
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

                {visible && portalId === PortalID.search && createPortal(
                    <SearchPortal />, document.body
                )}

                {isLoggedIn && visible && portalId === PortalID.question && createPortal(
                    <QuestionPortal />, document.body
                )}

                <ToastRenderer />
            </NDKProvider>
        </HelmetProvider>
    )
}

export default Root
