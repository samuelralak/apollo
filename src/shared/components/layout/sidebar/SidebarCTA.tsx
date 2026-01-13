import { useDispatch, useSelector } from "react-redux";
import { HugeiconsIcon } from "@hugeicons/react";
import { MessageAdd01Icon } from "@hugeicons-pro/core-duotone-rounded";
import { AppDispatch, RootState } from "../../../../app/store";
import { PortalID, showPortal } from "../../../store/portal.slice";
import { classNames } from "../../../../utils";

const SidebarCTA = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    const handleClick = () => {
        dispatch(showPortal({ portalId: isLoggedIn ? PortalID.question : PortalID.auth }));
    };

    return (
        <div className="px-2 lg:px-3 pt-5">
            <button
                onClick={handleClick}
                className={classNames(
                    "flex items-center justify-center gap-2",
                    "w-full py-2.5",
                    "rounded-lg",
                    "bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400",
                    "text-white text-sm font-semibold",
                    "transition-colors"
                )}
            >
                <HugeiconsIcon icon={MessageAdd01Icon} size={18} />
                <span className="hidden lg:inline">Ask</span>
            </button>
        </div>
    );
};

export default SidebarCTA;
