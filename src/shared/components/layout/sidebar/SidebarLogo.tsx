import { Link } from "react-router";

const SidebarLogo = () => {
    return (
        <div className="h-14 flex items-center px-3 lg:px-4">
            <Link to="/" className="flex items-center">
                <span className="text-slate-900 dark:text-white font-extrabold font-['Poppins'] text-base">
                    <span className="lg:hidden">[A]</span>
                    <span className="hidden lg:inline">[APOLLO]</span>
                </span>
            </Link>
        </div>
    );
};

export default SidebarLogo;
