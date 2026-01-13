import { useDispatch, useSelector } from "react-redux";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons-pro/core-solid-rounded";
import type { AppDispatch, RootState } from "../../../app/store";
import { showPortal, PortalID } from "../../store/portal.slice";
import { classNames } from "../../../utils";

interface FloatingActionButtonProps {
    className?: string;
}

const FloatingActionButton = ({ className }: FloatingActionButtonProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    const handleClick = () => {
        dispatch(showPortal({ portalId: isLoggedIn ? PortalID.question : PortalID.auth }));
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={classNames(
                "fixed z-40",
                "bottom-20 right-4",
                "flex items-center justify-center",
                "w-14 h-14",
                "rounded-full",
                "bg-teal-500 hover:bg-teal-600 active:bg-teal-700",
                "text-white",
                "shadow-lg shadow-teal-500/30",
                "transition-all duration-200",
                "hover:scale-105 active:scale-95",
                className
            )}
            aria-label="Ask a question"
        >
            <HugeiconsIcon icon={Add01Icon} size={24} />
        </button>
    );
};

export default FloatingActionButton;
