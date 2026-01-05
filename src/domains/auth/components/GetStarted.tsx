import {useDispatch} from "react-redux";
import {AppDispatch} from "../../../app/store";
import {PortalID, showPortal} from "../../../shared/store/portal.slice";

const GetStarted = () => {
    const dispatch = useDispatch<AppDispatch>()

    const handleClick = () => dispatch(showPortal({portalId: PortalID.auth}))

    return (
        <div className="flex-shrink-0">
            <button
                id="get-started"
                type="button"
                onClick={handleClick}
                className="relative inline-flex items-center rounded-lg bg-transparent px-3 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-transparent focus-visible:outline-none"
            >
                Get started
            </button>
        </div>
    )
}

export default GetStarted
