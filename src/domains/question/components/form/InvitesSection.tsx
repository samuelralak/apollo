import { NDKUser } from "@nostr-dev-kit/ndk";
import UserSearch from "../../../../shared/components/forms/UserSearch";
import AvatarPlaceholder from "../../../../shared/components/AvatarPlaceholder";
import { XMarkIcon } from "@heroicons/react/20/solid";

interface InvitesSectionProps {
    invitedUsers: NDKUser[];
    onInvite: (user: NDKUser) => void;
    onRemove: (pubkey: string) => void;
}

const InvitesSection = ({ invitedUsers, onInvite, onRemove }: InvitesSectionProps) => {
    return (
        <div className="bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-900/5 dark:ring-slate-700 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-full">
                        <label htmlFor="invites" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                            Invite Users
                        </label>
                        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Search for users you'd like to answer this question.
                        </div>
                        <div className="mt-4">
                            <UserSearch
                                onSelect={onInvite}
                                excludePubkeys={invitedUsers.map(u => u.pubkey)}
                            />
                        </div>

                        {invitedUsers.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {invitedUsers.map((user) => (
                                    <span
                                        key={user.pubkey}
                                        className="inline-flex items-center gap-x-1 rounded-md bg-teal-50 dark:bg-teal-900/30 px-2 py-1 text-xs font-medium text-teal-700 dark:text-teal-300 ring-1 ring-inset ring-teal-700/10 dark:ring-teal-300/10"
                                    >
                                        <div className="h-4 w-4 rounded-full overflow-hidden">
                                            {user.profile?.image ? (
                                                <img src={user.profile.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <AvatarPlaceholder mini />
                                            )}
                                        </div>
                                        {user.profile?.name ?? 'Unknown'}
                                        <button
                                            type="button"
                                            onClick={() => onRemove(user.pubkey)}
                                            className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-teal-600/20 dark:hover:bg-teal-400/20"
                                        >
                                            <span className="sr-only">Remove</span>
                                            <XMarkIcon className="h-3.5 w-3.5" strokeWidth={2} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InvitesSection
