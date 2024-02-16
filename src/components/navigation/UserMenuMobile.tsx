import {BellIcon} from "@heroicons/react/24/outline";
import {Disclosure} from "@headlessui/react";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../store";
import {AuthState, signOut} from "../../features/auth/auth-slice.ts";

const UserMenuMobile = ({auth}: { auth: AuthState }) => {
    const dispatch = useDispatch() as AppDispatch
    const onSignOut = () => dispatch(signOut())

    return (
        <div className="border-t border-gray-200 pb-3 pt-4">
            <div className="flex items-center px-4 sm:px-6">
                <div className="flex-shrink-0">
                    {auth.userProfile?.image || auth.userProfile?.picture ? (
                        <img className="h-10 w-10 rounded-lg object-cover" src={auth.userProfile.image ?? auth.userProfile?.picture} alt="avatar"/>
                    ) : (
                        <span className="h-10 w-10 rounded-lg">
                            <svg className="h-10 w-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        </span>
                    )}
                </div>

                <div className="ml-3">
                    <div
                        className="text-base font-medium text-gray-800">{auth.userProfile?.displayName ?? auth.userProfile?.name}</div>
                    <div className="text-sm font-medium text-gray-500">{auth.userProfile?.nip05}</div>
                </div>
                <button
                    type="button"
                    className="relative ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                    <span className="absolute -inset-1.5"/>
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true"/>
                </button>
            </div>
            <div className="mt-3 space-y-1">
                <Disclosure.Button
                    as="a"
                    href={`/user/${auth.pubkey}`}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                >
                    Your Profile
                </Disclosure.Button>
                <Disclosure.Button
                    as="a"
                    href="/settings/user-profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                >
                    Settings
                </Disclosure.Button>
                <Disclosure.Button
                    as="a"
                    onClick={onSignOut}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                >
                    Sign out
                </Disclosure.Button>
            </div>
        </div>
    )
}

export default UserMenuMobile
