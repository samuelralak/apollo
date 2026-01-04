import {FormEvent, useContext, useState} from "react";
import {createPortal} from "react-dom";
import {Dialog, DialogPanel, DialogTitle, DialogBackdrop} from "@headlessui/react";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {Link} from "react-router";
import {ExclamationTriangleIcon} from "@heroicons/react/20/solid";
import {NDKNip07Signer, NDKPrivateKeySigner, NDKSigner} from "@nostr-dev-kit/ndk";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../store";
import {NDKContext} from "../NDKProvider.tsx";
import {SignerMethod, signIn} from "../../features/auth/auth-slice.ts";
import {decodeNsec, validatePrivateKey} from "../../utils";
import secureLocalStorage from "react-secure-storage";
import constants from "../../constants";
import {ToastContext} from "../ToastProvider.tsx";

const GetStarted = () => {
    const {ndkInstance} = useContext(NDKContext) as NDKContext
    const {showToast} = useContext(ToastContext) as ToastContext
    const [showModal, setShowModal] = useState<boolean>(false)
    const [privateKey, setPrivateKey] = useState<string>('')
    const dispatch = useDispatch() as AppDispatch

    const _fetchProfileAndSignIn = async (signer: NDKSigner, signerMethod: SignerMethod) => {
        ndkInstance().signer = signer
        const ndkUser = await ndkInstance().signer!.user()
        await ndkUser.fetchProfile()

        dispatch(
            signIn({
                pubkey: ndkUser.pubkey,
                userProfile: ndkUser?.profile ?? {},
                signerMethod: signerMethod
            })
        )
    }

    const onPrivateKeyInput = (event: FormEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement
        setPrivateKey(target.value)
    }

    const continueWithExtension = async () => {
        try {
            const signer = new NDKNip07Signer(3000)
            await _fetchProfileAndSignIn(signer, SignerMethod.NIP07)
        } catch (e) {
            if (e instanceof Error) {
                showToast({title: 'Error', subtitle: e.message, type: 'error'})
            }
        }
    }

    const continueWithPrivateKey = async () => {
        if (validatePrivateKey(privateKey)) {
            try {
                const decodedKey = decodeNsec(privateKey as `nsec1${string}`)
                const signer = new NDKPrivateKeySigner(decodedKey as unknown as string)
                secureLocalStorage.setItem(constants.secureStorageKey, {privkey: decodedKey, nsec: privateKey})
                await _fetchProfileAndSignIn(signer, SignerMethod.PRIVATE_KEY)
            } catch (e) {
                if (e instanceof Error) {
                    showToast({title: 'Error', subtitle: e.message, type: 'error'})
                }
            }
        } else {
            showToast({title: 'Error', subtitle: 'Invalid private key', type: 'error'})
        }
    }

    return (
        <>
            <div className="flex-shrink-0">
                <button
                    id="get-started"
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="relative inline-flex items-center rounded-lg bg-transparent px-3 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-transparent focus-visible:outline-none "
                >
                    Get started
                </button>
            </div>

            {showModal && createPortal(
                <Dialog open={showModal} onClose={() => {}} className="relative z-10">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-out data-[closed]:opacity-0"
                    />

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div
                            className="flex min-h-full justify-center p-4 text-center items-start">
                            <DialogPanel
                                transition
                                className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all duration-300 ease-out my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:opacity-0 data-[closed]:translate-y-4 sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95"
                            >
                                <DialogTitle as="h2"
                                              className="font-semibold leading-6 text-slate-600 text-base flex justify-between items-center"
                                >
                                    Get started

                                    <XMarkIcon onClick={() => setShowModal(false)} className="h-5 w-5"/>
                                </DialogTitle>


                                <div className="mt-3">
                                    <h1 className="text-base font-semibold">Nostr Extension</h1>

                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Recommended. Sign in using a <Link
                                            to={'https://github.com/nostr-protocol/nips/blob/master/07.md'}
                                            className="underline">NIP-07</Link> nostr
                                            extension.
                                        </p>
                                        <ul className="list-disc mx-5 text-sm my-2 flex flex-col gap-y-0.5">
                                            <li>
                                                <Link to={'https://getalby.com/'}
                                                      className="text-blue-400 font-medium hover:text-blue-600 underline">
                                                    Alby
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    to={'https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp'}
                                                    className="text-blue-400 font-medium hover:text-blue-600 underline">
                                                    nos2x
                                                </Link>
                                            </li>
                                        </ul>

                                        <button type="button"
                                                onClick={continueWithExtension}
                                                className="border-0 bg-slate-700 py-3 px-2 text-sm rounded-lg font-semibold text-white my-3 w-full">
                                            Continue
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-gray-300"/>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span
                                            className="bg-white px-2 text-sm text-gray-500 font-medium">or</span>
                                    </div>
                                </div>

                                <div className="mt-1">
                                    <h1 className="text-base font-semibold">Private Key</h1>

                                    <div
                                        className="rounded-lg bg-yellow-50 py-3 px-1.5 my-3 border-2 border-yellow-100">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400"
                                                                         aria-hidden="true"/>
                                            </div>

                                            <div className="ml-3">
                                                <div className="text-sm text-yellow-700">
                                                    <p>
                                                        <span className="text-sm font-medium text-yellow-800">Not recommended</span>.
                                                        We do not store your keys, but use with caution.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <input
                                        type="password"
                                        value={privateKey}
                                        onInput={onPrivateKeyInput}
                                        placeholder="nsec..."
                                        className="mt-4 block w-full border-0 focus:border-0 rounded-lg py-2.5 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 leading-6 "
                                    />

                                    <button type="button"
                                            onClick={continueWithPrivateKey}
                                            className="border-0 bg-slate-700 py-3 px-2 text-sm rounded-lg font-semibold text-white my-3 w-full">
                                        Continue
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>, document.body
            )}
        </>
    )
}

export default GetStarted
