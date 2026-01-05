import {HugeiconsIcon} from "@hugeicons/react";
import {UserCircleIcon} from "@hugeicons-pro/core-twotone-rounded";
import {classNames} from "../../utils";

const AvatarPlaceholder = ({mini}: { mini?: boolean }) => {
    return (
        <span
            className={classNames(mini ? 'h-5 w-5 rounded' : 'h-9 w-9 rounded-lg', 'inline-flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-700')}
        >
            <HugeiconsIcon icon={UserCircleIcon} className="h-full w-full text-slate-300 dark:text-slate-500" size={mini ? 20 : 36} />
        </span>
    )
}

export default AvatarPlaceholder
