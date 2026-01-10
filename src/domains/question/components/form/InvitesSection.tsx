import { NDKUser } from "@nostr-dev-kit/ndk";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, UserIcon } from "@hugeicons-pro/core-solid-rounded";
import UserSearch from "../../../../shared/components/forms/UserSearch";

interface InvitesSectionProps {
    invitedUsers: NDKUser[];
    onInvite: (user: NDKUser) => void;
    onRemove: (pubkey: string) => void;
}

const InvitesSection = ({ invitedUsers, onInvite, onRemove }: InvitesSectionProps) => {
    return (
        <div className="sm:col-span-4">
            <label htmlFor="invites" className="block font-medium leading-6 text-slate-900 dark:text-slate-100">
                Invite Users
                <span className="text-slate-400 dark:text-slate-500 text-sm font-normal ml-1">(optional)</span>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
                    Search for users you'd like to invite to answer this question
                </p>
            </label>
            <div className="mt-5 w-full">
                <UserSearch
                    onSelect={onInvite}
                    excludePubkeys={invitedUsers.map(u => u.pubkey)}
                />

                {/* Invited Users Chips */}
                {invitedUsers.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                            {invitedUsers.length} user{invitedUsers.length !== 1 ? 's' : ''} invited
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {invitedUsers.map((user) => (
                                <span
                                    key={user.pubkey}
                                    className="group inline-flex items-center gap-x-2 rounded-full bg-teal-50 dark:bg-teal-900/30 pl-1 pr-2 py-1 text-sm font-medium text-teal-700 dark:text-teal-300 ring-1 ring-inset ring-teal-600/20 dark:ring-teal-400/20 transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/50"
                                >
                                    {/* User Avatar */}
                                    <div className="h-6 w-6 rounded-full overflow-hidden bg-teal-100 dark:bg-teal-800 flex-shrink-0">
                                        {(user.profile?.image || user.profile?.picture) ? (
                                            <img
                                                src={user.profile.image ?? user.profile.picture}
                                                alt=""
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.style.display = 'none'
                                                    target.parentElement!.innerHTML = `<div class="h-full w-full flex items-center justify-center"><svg class="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`
                                                }}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <HugeiconsIcon icon={UserIcon} size={14} className="text-teal-600 dark:text-teal-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* User Name */}
                                    <span className="truncate max-w-[120px]">
                                        {user.profile?.name || user.profile?.display_name || 'Anonymous'}
                                    </span>

                                    {/* Remove Button */}
                                    <button
                                        type="button"
                                        onClick={() => onRemove(user.pubkey)}
                                        className="flex-shrink-0 rounded-full p-0.5 text-teal-600/70 dark:text-teal-400/70 hover:text-teal-800 dark:hover:text-teal-200 hover:bg-teal-200/50 dark:hover:bg-teal-700/50 transition-colors"
                                        aria-label={`Remove ${user.profile?.name || 'user'}`}
                                    >
                                        <HugeiconsIcon icon={Cancel01Icon} size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default InvitesSection
