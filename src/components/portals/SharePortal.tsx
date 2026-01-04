import {Dialog, DialogPanel, DialogTitle, DialogBackdrop} from "@headlessui/react";
import {useContext, useEffect, useState} from "react";
import {DocumentDuplicateIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../store";
import {hidePortal} from "../../features/portal/portal-slice.ts";
import {NDKContext} from "../NDKProvider.tsx";
import Question, {transformer as questionTransformer} from "../../resources/question.ts";
import {Answer, transformer as answerTransformer} from "../../resources/answer.ts";
import constants from "../../constants";
import {NDKEvent, NDKKind} from "@nostr-dev-kit/ndk";
import {classNames, copyToClipboard} from "../../utils";
import {nip19} from "nostr-tools";
import {ToastContext} from "../ToastProvider.tsx";

type Resource = Question | Answer

enum TabID {
    nostr = "nostr",
    web = "web"
}

interface Tab {
    id: TabID;
    name: string;
    shareUrl?: string;
}

interface Props {
    visible: boolean;
    eventCoordinate: string;
    eventId: string;
}

const getShareUrl = (resource: Resource) => {
    const baseUrl = "/questions"

    if ("questionId" in resource) {
        return baseUrl + `/${resource.questionId}?answerId=${resource.id}&eventId=${resource.eventId}`
    }

    return baseUrl + `/${resource.id}?eventId=${resource.eventId}`
}

const naddrEncode = (resourceId: string, eventCoordinate: string): `nostr:naddr1${string}` => {
    const [kind, author] = eventCoordinate.split(":")
    const naddr = nip19.naddrEncode({pubkey: author, kind: parseInt(kind), identifier: resourceId})
    return `nostr:${naddr}`
}

const transformEvent = (event: NDKEvent): Resource | undefined => {
    switch (event.kind) {
        case constants.questionKind:
            return questionTransformer(event)
        case constants.answerKind:
            return answerTransformer(event)
        default:
        // Do nothing for now
    }

    return undefined
}

const origin = window.location.origin
const shareTabs: Record<TabID, Tab> = {
    [TabID.nostr]: {id: TabID.nostr, name: 'Share on Nostr'},
    [TabID.web]: {id: TabID.web, name: 'Web URL'}
}

const SharePortal = ({visible, eventCoordinate, eventId}: Props) => {
    const dispatch = useDispatch() as AppDispatch
    const {showToast} = useContext(ToastContext) as ToastContext
    const {ndkInstance, publishEvent} = useContext(NDKContext) as NDKContext
    const [resource, setResource] = useState<Resource>()
    const [selectedTab, setSelectedTab] = useState<Tab>(shareTabs.nostr)
    const [sharing, setSharing] = useState<boolean>(false)

    const handleHidePortal = () => dispatch(hidePortal())

    const handleShareEvent = async (kind: NDKKind) => {
        setSharing(true)
        if (resource) {
            const tags = [['p', resource.user.pubkey]]
            const shareUrl = origin + getShareUrl(resource)
            const content = kind === constants.noteKind ? `${shareUrl}\n\n${selectedTab.shareUrl}` : resource?.description
            await publishEvent(kind, content, kind === constants.shareKind ? [...tags, ...[["r", shareUrl]]] : tags)
            showToast({title: 'Post successfully shared!', type: 'success'})
        }
        setSharing(false)
    }

    const handleTabChange = (tabId: TabID) => {
        const changedTab: Tab = shareTabs[tabId]
        changedTab.shareUrl ||= changedTab.id === TabID.nostr ? naddrEncode(resource!.id!, eventCoordinate) : origin + getShareUrl(resource!)
        setSelectedTab(changedTab)
    }

    const handleCopyToClipboard = async (text: string) => {
        await copyToClipboard(text, () => {
            showToast({
                title: 'Copied to clipboard',
                type: 'success'
            })
        })
    }

    useEffect(() => {
        (async () => {
            const [kind, author] = eventCoordinate.split(":")
            const resourceEvent = await ndkInstance().fetchEvent({
                kinds: [parseInt(kind)],
                ids: [eventId],
                authors: [author]
            })

            if (resourceEvent) {
                const resourceFromEvent = transformEvent(resourceEvent)

                if (resourceFromEvent) {
                    selectedTab.shareUrl = naddrEncode(resourceFromEvent.id!, eventCoordinate)
                    setResource(resourceFromEvent)
                }
            }
        })()
    }, []);

    console.log({selectedTab})

    return (
        <Dialog open={visible} onClose={() => {}} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-out data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div
                    className="flex min-h-full justify-center p-4 text-center items-start">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all duration-300 ease-out my-8 w-full sm:max-w-xl sm:p-6 data-[closed]:opacity-0 data-[closed]:translate-y-4 sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95"
                    >
                        <DialogTitle as="h2"
                                      className="font-bold leading-6 text-slate-600 text-xl flex justify-between items-center"
                        >
                            Share
                            <XMarkIcon onClick={handleHidePortal} className="h-5 w-5"/>
                        </DialogTitle>

                        <div className="mt-5">
                            <div className="sm:hidden">
                                <label htmlFor="tabs" className="sr-only">
                                    Select a tab
                                </label>
                                <select
                                    id="tabs"
                                    name="tabs"
                                    onChange={(event) => handleTabChange(event.currentTarget.value as TabID)}
                                    className="block w-full rounded-lg border-slate-300 border-2 text-sm py-3 focus:border-slate-600 focus:ring-slate-600"
                                    defaultValue={selectedTab.name}
                                >
                                    {Object.values(shareTabs).map((tab) => (
                                        <option value={tab.id} key={tab.name}>{tab.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="hidden sm:block">
                                <nav className="flex space-x-4" aria-label="Tabs">
                                    {Object.values(shareTabs).map((tab) => (
                                        <a
                                            key={tab.name}
                                            onClick={() => handleTabChange(tab.id)}
                                            className={classNames(
                                                tab.id === selectedTab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700',
                                                'rounded-md px-3 py-2 text-sm font-medium cursor-pointer'
                                            )}
                                            aria-current={tab.id === selectedTab.id ? 'page' : undefined}
                                        >
                                            {tab.name}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="flex gap-x-2 items-center justify-center my-5">
                                <input
                                    value={selectedTab.shareUrl || ''}
                                    disabled={true}
                                    readOnly={true}
                                    placeholder="lnb1..."
                                    className="flex-1 block w-full border-0 focus:border-0 rounded-lg py-2.5 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-6 "
                                />
                                <button
                                    className="flex items-center justify-center p-3 border-0 rounded-lg cursor-pointer"
                                >
                                    <DocumentDuplicateIcon
                                        onClick={() => handleCopyToClipboard(selectedTab.shareUrl || '')}
                                        className="h-5 w-5"/>
                                </button>
                            </div>

                            {selectedTab.id === TabID.nostr && (
                                <div className="flex gap-2">
                                    <button type="button"
                                            onClick={() => handleShareEvent(constants.shareKind)}
                                            disabled={sharing}
                                            className="border-0 bg-slate-700 py-3 px-2 text-sm rounded-lg font-semibold text-white my-3 min-w-24"
                                    >
                                        Share
                                    </button>

                                    <button type="button"
                                            onClick={() => handleShareEvent(constants.noteKind)}
                                            disabled={sharing}
                                            className="border-0 bg-white py-3 px-2 text-sm rounded-lg font-semibold text-slate-700 my-3 min-w-24"
                                    >
                                        Publish note
                                    </button>
                                </div>
                            )}
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default SharePortal
