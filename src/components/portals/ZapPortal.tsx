import {Dialog, Transition} from "@headlessui/react";
import {Fragment, ReactNode, useContext, useEffect, useState} from "react";
import QRCode from "qrcode";
import {DocumentDuplicateIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {BoltIcon} from "@heroicons/react/24/solid";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import zapSchema from "../../schemas/zap-schema";
import constants from "../../constants";
import {z} from "zod";
import {NDKContext} from "../NDKProvider.tsx";
import {NDKEvent, NostrEvent} from "@nostr-dev-kit/ndk";
import {nip19} from "nostr-tools";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";
import {hidePortal} from "../../features/portal/portal-slice.ts";
import {copyToClipboard, tagFromEvents} from "../../utils";
import {ToastContext} from "../ToastProvider.tsx";

interface Props {
    pubkey: string;
    eventId?: string;
    eventCoordinate?: string;
}

const MAX_INTERVAL_COUNT = 60
const INTERVAL_SECONDS = 1000

const eventTags = (eventId?: string, eventCoordinate?: string): string[][] => {
    return [
        ...(eventId ? [['a', eventId]] : []),
        ...(eventCoordinate ? [['a', eventCoordinate]] : [])
    ]
}

const ZapPortal = ({pubkey, eventId, eventCoordinate}: Props) => {
    const dispatch = useDispatch() as AppDispatch
    const {webln} = window
    const {showToast} = useContext(ToastContext) as ToastContext
    const {ndkInstance, signer} = useContext(NDKContext) as NDKContext
    const [intervalCount, setIntervalCount] = useState<number>(0)
    const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false)
    const [weblnEnabled, setWeblnEnabled] = useState<boolean>(false)
    const [invoice, setInvoice] = useState<string | undefined>()
    const {visible} = useSelector((state: RootState) => state.portal)
    const {handleSubmit, register, watch, formState: {errors}} = useForm({
        resolver: zodResolver(zapSchema), defaultValues: {
            amount: constants.defaultZapAmount,
            comment: ''
        }
    })

    const amount = watch('amount')

    const onZapSubmit: SubmitHandler<z.infer<typeof zapSchema>> = async ({amount, comment}) => {
        const recipient = ndkInstance().getUser({npub: nip19.npubEncode(pubkey)})
        const extraTags = eventTags(eventId, eventCoordinate)
        const millisats = amount * 1000 // convert to millisats
        const ndkEvent = new NDKEvent(ndkInstance(), {kind: 9734} as NostrEvent)
        await ndkEvent.sign(signer()!)

        const invoiceFromRequest = await ndkEvent.zap(millisats, comment, extraTags, recipient, signer()!)

        if (invoiceFromRequest) {
            setInvoice(invoiceFromRequest!)
            setWaitingForResponse(true)

            try {
                if (!weblnEnabled) {
                    const timeout = setTimeout(async () => {
                        await QRCode.toCanvas(document.getElementById('invoice'), invoiceFromRequest!)
                        clearTimeout(timeout)
                    }, 500)
                } else {
                    await webln?.sendPayment(invoiceFromRequest)
                }
            } catch (e) {
                setWaitingForResponse(false)
                dispatch(hidePortal())

                if (e instanceof Error) {
                    showToast({title: 'Error', subtitle: e.message, type: 'error'})
                }
            }
        }
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
            if (webln) {
                try {
                    await webln.enable()
                    setWeblnEnabled(true)
                } catch (e) {
                    if (e instanceof Error) {
                        showToast({title: 'Error', subtitle: e.message, type: 'error'})
                    }
                }
            }
        })()

    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (waitingForResponse) {
            interval = setInterval(() => {
                const count = intervalCount + 1

                if (count === MAX_INTERVAL_COUNT) {
                    clearInterval(interval)
                    setWaitingForResponse(false)
                } else {
                    if (count % 2 === 0) {
                        ndkInstance()
                            .fetchEvent({kinds: [9735], since: Math.floor((Date.now() / 1000) - 2), "#p": [pubkey]})
                            .then((event) => {
                                if (event) {
                                    const tags = tagFromEvents(event.tags)

                                    if (tags['bolt11'][0] === invoice) {
                                        setWaitingForResponse(false)
                                        clearInterval(interval)
                                        dispatch(hidePortal())
                                    }
                                }
                            })
                    }

                    setIntervalCount(count)
                }
            }, INTERVAL_SECONDS)
        }

        return () => clearInterval(interval)
    }, [waitingForResponse, intervalCount]);

    return (
        <Transition.Root show={visible} as={Fragment}>
            <Dialog as="div" className="relative z-10" static onClose={() => {
            }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div
                        className="flex min-h-full justify-center p-4 text-center items-start">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel
                                className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all my-8 w-full sm:max-w-sm sm:p-6"
                            >
                                <Dialog.Title as="h2"
                                              className="font-bold leading-6 text-slate-600 text-xl flex justify-between items-center"
                                >
                                    Zap

                                    <XMarkIcon onClick={() => dispatch(hidePortal())} className="h-5 w-5"/>
                                </Dialog.Title>

                                <div className="mt-5">
                                    <div className="flex my-5 w-full justify-center">
                                        <h1 className="text-3xl font-bold ordinal tabular-nums text-center text-slate-700">{amount ? amount : 0}</h1>
                                        <span className="text-sm font-medium text-slate-500">sats</span>
                                    </div>

                                    {(invoice && !weblnEnabled) ? (
                                        <div>
                                            <canvas id="invoice" className="mx-auto"/>
                                            <div className="flex gap-x-2 items-center justify-center my-5">
                                                <input
                                                    value={invoice}
                                                    disabled={true}
                                                    readOnly={true}
                                                    placeholder="lnb1..."
                                                    className="flex-1 block w-full border-0 focus:border-0 rounded-lg py-2.5 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-6 "
                                                />
                                                <button
                                                    className="flex items-center justify-center p-3 border-0 rounded-lg cursor-pointer"
                                                >
                                                    <DocumentDuplicateIcon onClick={() => handleCopyToClipboard(invoice!)} className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div>
                                                <div className="relative mt-2 rounded-lg bg-slate-200">
                                                    <div
                                                        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                                        <BoltIcon className="h-4 w-4 text-slate-700"/>
                                                    </div>
                                                    <input
                                                        {...register('amount')}
                                                        className="block w-full  bg-slate-100 focus:bg-white rounded-lg border-0 py-3 pl-7 pr-12 text-slate-900 ring-2 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 text-sm sm:leading-6"
                                                        placeholder="0"
                                                        aria-describedby="sats"
                                                    />
                                                    <div
                                                        className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
                                                    >
                                                        <span className="text-slate-600 text-sm font-medium"
                                                              id="price-currency"
                                                        >
                                                            sats
                                                        </span>
                                                    </div>
                                                </div>

                                                {errors.amount && (
                                                    <p className="mt-2 text-sm text-red-600" id="email-error">
                                                        {errors.amount.message as ReactNode}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-2">
                                                <textarea
                                                    {...register('comment')}
                                                    rows={3}
                                                    placeholder="add an optional message"
                                                    className="block w-full bg-slate-100 focus:bg-white rounded-lg border-0 py-1.5 text-slate-900 ring-2 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 text-sm sm:leading-6"
                                                />

                                                {errors.comment && (
                                                    <p className="mt-2 text-sm text-red-600" id="email-error">
                                                        {errors.comment.message as ReactNode}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-1 flex justify-end">
                                                <button type="button"
                                                        onClick={() => {
                                                            dispatch(hidePortal())
                                                        }}
                                                        className="text-sm font-semibold py-3 px-3 text-slate-600"
                                                >
                                                    Cancel
                                                </button>
                                                <button type="button"
                                                        onClick={handleSubmit(onZapSubmit)}
                                                        className="border-0 bg-slate-700 py-3 px-2 text-sm rounded-lg font-semibold text-white my-3 min-w-24"
                                                >
                                                    Zap!
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {waitingForResponse && (
                                        <button className="text-slate-600 w-full text-center py-3.5 animate-pulse">
                                            waiting for response...
                                        </button>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default ZapPortal
