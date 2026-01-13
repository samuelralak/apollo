import { Link } from "react-router";
import LogoIcon from "../../../../assets/logo-icon.svg";
import LogoIconDark from "../../../../assets/logo-icon-dark.svg";
import LogoFull from "../../../../assets/logo-full.svg";
import LogoFullDark from "../../../../assets/logo-full-dark.svg";

const SidebarLogo = () => {
    return (
        <div className="h-14 flex items-center px-3 lg:px-4">
            <Link to="/" className="flex items-center">
                {/* Collapsed: Icon only */}
                <span className="lg:hidden">
                    <img src={LogoIcon} alt="Apollo" className="h-10 w-10 dark:hidden" />
                    <img src={LogoIconDark} alt="Apollo" className="h-10 w-10 hidden dark:block" />
                </span>
                {/* Expanded: Full logo with wordmark */}
                <span className="hidden lg:block">
                    <img src={LogoFull} alt="Apollo" className="h-9 dark:hidden" />
                    <img src={LogoFullDark} alt="Apollo" className="h-9 hidden dark:block" />
                </span>
            </Link>
        </div>
    );
};

export default SidebarLogo;
