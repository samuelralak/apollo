import {useParams} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {NDKContext} from "../../components/NDKProvider.tsx";
import {NDKUserProfile} from "@nostr-dev-kit/ndk";
import Loader from "../../components/Loader.tsx";
import {classNames} from "../../utils";
import BannerPlaceholder from '../../assets/banner-placeholder.png'

interface Tab {
    name: string;
    href: string;
    current: boolean;
}

const tabs: Tab[] = [
    {name: 'About', href: '#', current: true},
    {name: '0 Answers', href: '#', current: false},
    {name: '0 Questions', href: '#', current: false},
]

const ProfilePage = () => {
    const {pubkey} = useParams()
    const {ndkInstance} = useContext(NDKContext) as NDKContext
    const [profile, setUserProfile] = useState<NDKUserProfile>()
    const [fetchingProfile, setFetchingProfile] = useState<boolean>(true)

    useEffect(() => {
        (async () => {
            const user = ndkInstance().getUser({pubkey})
            await user.fetchProfile()
            setUserProfile(user.profile)
            setFetchingProfile(false)
        })()
    }, []);


    if (fetchingProfile) {
        return <Loader loadingText={'fetching profile'}/>
    }

    return (
        <>
            <div>
                <div>
                    <img className="h-32 w-full object-cover lg:h-48 rounded-xl bg-slate-100" src={profile?.banner ?? BannerPlaceholder} alt=""/>
                </div>
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                        <div className="flex">
                            {profile?.image || profile?.picture ? (
                                <img className="h-24 w-24 rounded-lg ring-4 ring-white sm:h-32 sm:w-32 object-cover" src={profile?.image ?? profile?.picture} alt=""/>
                            ) : (
                                <span
                                    className="h-24 w-24 rounded-lg sm:h-32 sm:w-32 inline-block overflow-hidden bg-slate-100 ring-4 ring-white"
                                >
                                    <svg className="h-full w-full text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                </span>
                            )}
                        </div>
                        <div
                            className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                            <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                                <h1 className="truncate text-2xl font-bold text-gray-900">{profile?.displayName}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
                        <h1 className="truncate text-2xl font-bold text-gray-900">{profile?.displayName}</h1>
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-200 pb-5 sm:pb-0">
                <div className="mt-8 sm:mt-10">
                    <div className="sm:hidden">
                        <label htmlFor="current-tab" className="sr-only">
                            Select a tab
                        </label>
                        <select
                            id="current-tab"
                            name="current-tab"
                            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
                            defaultValue={tabs.find((tab) => tab.current)!.name}
                        >
                            {tabs.map((tab) => (
                                <option key={tab.name}>{tab.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="hidden sm:block">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                                <a
                                    key={tab.name}
                                    href={tab.href}
                                    className={classNames(
                                        tab.current
                                            ? 'border-slate-500 text-slate-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                        'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium'
                                    )}
                                    aria-current={tab.current ? 'page' : undefined}
                                >
                                    {tab.name}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </>
    )

}

export default ProfilePage
