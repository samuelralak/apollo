import {useSelector} from "react-redux";
import {RootState} from "../../../store";
import {SubmitHandler, useForm} from "react-hook-form";
import userProfileSchema, {UserProfileSchemaType} from "../../../schemas/user-profile-schema.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import {NDKUserProfile} from "@nostr-dev-kit/ndk";
import {ReactNode, useContext, useState} from "react";
import {NDKContext} from "../../../components/NDKProvider.tsx";
import {ToastContext} from "../../../components/ToastProvider.tsx";

const displayNameFromProfile = (userProfile: NDKUserProfile) => {
    const name = (userProfile?.displayName ?? userProfile?.display_name ?? "").split(" ")
    const [firstName, ...rest] = name
    const lastName = (rest ?? []).join(" ")

    return {firstName, lastName}
}

const UserProfileSettingsPage = () => {
    const {ndkInstance} = useContext(NDKContext) as NDKContext
    const {showToast} = useContext(ToastContext) as ToastContext
    const [publishing, setPublishing] = useState<boolean>(false)
    const auth = useSelector((state: RootState) => state.auth)
    const userProfile = auth.userProfile
    const {register, handleSubmit, formState: {errors}} = useForm<UserProfileSchemaType>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            firstName: displayNameFromProfile(userProfile ?? {}).firstName,
            lastName: displayNameFromProfile(userProfile ?? {}).lastName,
            name: userProfile?.name,
            about: userProfile?.about,
            nip05: userProfile?.nip05,
            lud16: userProfile?.lud16,
            website: userProfile?.website
        }
    })

    const handleUserProfileUpdate: SubmitHandler<UserProfileSchemaType> = async (data) => {
        setPublishing(true)
        const {firstName, lastName, ...rest} = data
        const payload = {...rest, display_name: `${firstName} ${lastName}`, displayName: `${firstName} ${lastName}`}

        try {
            const ndkUser = ndkInstance().getUser({pubkey: auth.pubkey})
            await ndkUser.fetchProfile()

            ndkUser.profile = {...ndkUser.profile, ...payload}
            await ndkUser.publish()

            showToast({
                title: 'Event published successfully!',
                type: 'success'
            })
        } catch (e) {
            console.log({e})
            showToast({
                title: 'Error publishing event! Please sign out and sign back in!',
                type: 'error'
            })
        } finally {
            setPublishing(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
                <h2 className="text-base font-semibold leading-7 text-gray-900">Profile</h2>
                <p className="mt-1 text-sm leading-6 text-gray-500 mb-5">
                    This information will be displayed publicly so be careful what you share.
                </p>

                <form className="md:col-span-2" onSubmit={handleSubmit(handleUserProfileUpdate)}>
                    <div
                        className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6  border-t border-t-slate-200 pt-5">

                        <div className="sm:col-span-3">
                            <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-slate-600">
                                First name
                            </label>
                            <div className="mt-2">
                                <input
                                    {...register('firstName')}
                                    className="block w-full border-0 focus:border-0 rounded-md py-3 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-6"
                                />
                            </div>
                            {errors.firstName && (
                                <p className="mt-2 text-sm text-red-600" id="email-error">
                                    {errors.firstName.message as ReactNode}
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-slate-600">
                                Last name
                            </label>
                            <div className="mt-2">
                                <input
                                    {...register('lastName')}
                                    className="block w-full border-0 focus:border-0 rounded-md py-3 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-6"
                                />
                            </div>
                            {errors.lastName && (
                                <p className="mt-2 text-sm text-red-600" id="email-error">
                                    {errors.lastName.message as ReactNode}
                                </p>
                            )}
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-600">
                                Username
                            </label>
                            <div className="mt-2">
                                <input
                                    {...register('name')}
                                    className="block w-full border-0 focus:border-0 rounded-md py-3 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-6"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600" id="email-error">
                                    {errors.name.message as ReactNode}
                                </p>
                            )}
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="username" className="block text-sm font-medium leading-6  text-slate-600">
                                Website
                            </label>
                            <div className="mt-2">
                                <input
                                    {...register('website')}
                                    className="block w-full border-0 focus:border-0 rounded-md py-3 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-6"
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="username" className="block text-sm font-medium leading-6  text-slate-600">
                                Bitcoin Lightning address
                            </label>
                            <div className="mt-2">
                                <input
                                    {...register('lud16')}
                                    className="block w-full border-0 focus:border-0 rounded-md py-3 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-6"
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="username" className="block text-sm font-medium leading-6  text-slate-600">
                                Nostr address (NIP-05)
                            </label>
                            <div className="mt-2">
                                <input
                                    {...register('nip05')}
                                    className="block w-full border-0 focus:border-0 rounded-md py-3 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-6"
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="username" className="block text-sm font-medium leading-6  text-slate-600">
                                About
                            </label>
                            <div className="mt-2">
                                <textarea
                                    {...register('about')}
                                    className="block w-full border-0 focus:border-0 rounded-md py-3 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-6"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex">
                        <button
                            disabled={publishing}
                            type="submit"
                            className="rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                        >
                            {publishing ? 'Updating profile...' : 'Update profile'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}

export default UserProfileSettingsPage
