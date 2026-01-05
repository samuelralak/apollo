import {FormEvent, useContext, useState} from "react";
import {Dialog, DialogPanel, DialogTitle, DialogBackdrop} from "@headlessui/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {Cancel01Icon, Alert01Icon} from "@hugeicons-pro/core-twotone-rounded";
import {Link} from "react-router";
import {NDKNip07Signer, NDKPrivateKeySigner, NDKSigner} from "@nostr-dev-kit/ndk";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import {SignerMethod, signIn} from "../../../domains/auth/store/auth.slice";
import {decodeNsec, validatePrivateKey} from "../../../utils";
import secureLocalStorage from "react-secure-storage";
import constants from "../../../constants";
import {showToast} from "../../store/toast.slice";
import {hidePortal} from "../../store/portal.slice";

const GetStartedPortal = () => {
    const dispatch = useDispatch<AppDispatch>()
    const {ndkInstance} = useContext(NDKContext) as NDKContext
    const visible = useSelector((state: RootState) => state.portal.visible)
    const [privateKey, setPrivateKey] = useState<string>('')

    const handleClose = () => dispatch(hidePortal())

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
        handleClose()
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
                dispatch(showToast({title: 'Error', subtitle: e.message, type: 'error'}))
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
                    dispatch(showToast({title: 'Error', subtitle: e.message, type: 'error'}))
                }
            }
        } else {
            dispatch(showToast({title: 'Error', subtitle: 'Invalid private key', type: 'error'}))
        }
    }

    return (
        <Dialog open={visible} onClose={handleClose} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out data-closed:opacity-0"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full justify-center p-4 text-center items-start">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-xl bg-white dark:bg-slate-800 px-4 pb-4 pt-5 text-left shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] my-8 sm:w-full sm:max-w-sm sm:p-6 data-closed:opacity-0 data-closed:scale-95 data-closed:-translate-y-4"
                    >
                        <DialogTitle as="h2"
                                     className="font-semibold leading-6 text-slate-700 dark:text-slate-200 text-base flex justify-between items-center"
                        >
                            Get started
                            <HugeiconsIcon icon={Cancel01Icon} size={20} onClick={handleClose} className="cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"/>
                        </DialogTitle>

                        <div className="mt-3">
                            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">Nostr Extension</h1>

                            <div className="mt-2">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Recommended. Sign in using a <Link
                                    to={'https://github.com/nostr-protocol/nips/blob/master/07.md'}
                                    className="underline text-teal-600 dark:text-teal-400">NIP-07</Link> nostr
                                    extension.
                                </p>
                                <ul className="list-disc mx-5 text-sm my-2 flex flex-col gap-y-0.5">
                                    <li>
                                        <Link to={'https://getalby.com/'}
                                              className="text-teal-600 dark:text-teal-400 font-medium hover:text-teal-700 dark:hover:text-teal-300 underline">
                                            Alby
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={'https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp'}
                                            className="text-teal-600 dark:text-teal-400 font-medium hover:text-teal-700 dark:hover:text-teal-300 underline">
                                            nos2x
                                        </Link>
                                    </li>
                                </ul>

                                <button type="button"
                                        onClick={continueWithExtension}
                                        className="border-0 bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400 py-3 px-2 text-sm rounded-lg font-semibold text-white my-3 w-full transition-colors">
                                    Continue
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-300 dark:border-slate-600"/>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white dark:bg-slate-800 px-2 text-sm text-slate-500 dark:text-slate-400 font-medium">or</span>
                            </div>
                        </div>

                        <div className="mt-1">
                            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">Private Key</h1>

                            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 py-3 px-1.5 my-3 border-2 border-yellow-100 dark:border-yellow-800">
                                <div className="flex">
                                    <div className="shrink-0">
                                        <HugeiconsIcon icon={Alert01Icon} size={20} className="text-yellow-500 dark:text-yellow-400" />
                                    </div>

                                    <div className="ml-3">
                                        <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                            <p>
                                                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Not recommended</span>.
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
                                className="mt-4 block w-full border-0 focus:border-0 rounded-lg py-2.5 px-2 text-sm text-slate-900 dark:text-slate-100 ring-2 outline-none ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500 leading-6"
                            />

                            <button type="button"
                                    onClick={continueWithPrivateKey}
                                    className="border-0 bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400 py-3 px-2 text-sm rounded-lg font-semibold text-white my-3 w-full transition-colors">
                                Continue
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default GetStartedPortal
