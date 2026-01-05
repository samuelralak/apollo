import {useDispatch} from "react-redux";
import {AppDispatch} from "../../../app/store";
import {PortalID, showPortal} from "../../../shared/store/portal.slice";

const GetStarted = () => {
    const dispatch = useDispatch<AppDispatch>()

    const handleClick = () => dispatch(showPortal({portalId: PortalID.auth}))

    return (
        <button
            id="get-started"
            type="button"
            onClick={handleClick}
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
            Get started
        </button>
    )
}

export default GetStarted
