import {BellIcon} from "@heroicons/react/24/outline";
import {DisclosureButton} from "@headlessui/react";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../../app/store";
import {AuthState, signOut} from "../store/auth.slice";

const UserMenuMobile = ({auth}: { auth: AuthState }) => {
    const dispatch = useDispatch() as AppDispatch
    const onSignOut = () => dispatch(signOut())

    return (
        <div className="border-t border-slate-200 dark:border-slate-700 pb-3 pt-4">
            <div className="flex items-center px-4 sm:px-6">
                <div className="flex-shrink-0">
                    {auth.userProfile?.image || auth.userProfile?.picture ? (
                        <img className="h-10 w-10 rounded-lg object-cover" src={auth.userProfile.image ?? auth.userProfile?.picture} alt="avatar"/>
                    ) : (
                        <span className="h-10 w-10 rounded-lg">
                            <svg className="h-10 w-10 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        </span>
                    )}
                </div>

                <div className="ml-3">
                    <div
                        className="text-base font-medium text-slate-800 dark:text-slate-200">{auth.userProfile?.displayName ?? auth.userProfile?.name}</div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{auth.userProfile?.nip05}</div>
                </div>
                <button
                    type="button"
                    className="relative ml-auto flex-shrink-0 rounded-full bg-white dark:bg-slate-800 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                    <span className="absolute -inset-1.5"/>
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true"/>
                </button>
            </div>
            <div className="mt-3 space-y-1">
                <DisclosureButton
                    as="a"
                    href={`/user/${auth.pubkey}`}
                    className="block px-4 py-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 sm:px-6"
                >
                    Your Profile
                </DisclosureButton>
                <DisclosureButton
                    as="a"
                    href="/settings/user-profile"
                    className="block px-4 py-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 sm:px-6"
                >
                    Settings
                </DisclosureButton>
                <DisclosureButton
                    as="a"
                    onClick={onSignOut}
                    className="block px-4 py-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 sm:px-6 cursor-pointer"
                >
                    Sign out
                </DisclosureButton>
            </div>
        </div>
    )
}

export default UserMenuMobile
