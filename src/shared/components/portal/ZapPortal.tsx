import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { ReactNode, useContext, useRef } from "react";
import { useUpdateEffect } from "@react-hookz/web";
import QRCode from "qrcode";
import { DocumentDuplicateIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import zapSchema, { ZapSchemaType } from "../../schemas/zap.schema";
import constants from "../../../constants";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { hidePortal } from "../../store/portal.slice";
import { copyToClipboard } from "../../../utils";
import { ToastContext } from "../feedback/ToastProvider";
import useWebLN from "../../hooks/useWebLN";
import useZapInvoice from "../../hooks/useZapInvoice";
import useZapReceipt from "../../hooks/useZapReceipt";

interface Props {
    pubkey: string;
    eventId?: string;
    eventCoordinate?: string;
}

const ZapPortal = ({ pubkey, eventId, eventCoordinate }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const { showToast } = useContext(ToastContext) as ToastContext;
    const { visible } = useSelector((state: RootState) => state.portal);
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);

    // Custom hooks for zap functionality
    const webln = useWebLN();
    const zapInvoice = useZapInvoice(pubkey);
    const zapReceipt = useZapReceipt({
        pubkey,
        onReceived: () => dispatch(hidePortal())
    });

    // Form setup
    const { handleSubmit, register, watch, formState: { errors } } = useForm<ZapSchemaType>({
        resolver: zodResolver(zapSchema),
        defaultValues: {
            amount: constants.defaultZapAmount,
            comment: ''
        }
    });

    const amount = watch('amount');

    const onSubmit: SubmitHandler<ZapSchemaType> = async ({ amount, comment }) => {
        const invoice = await zapInvoice.generateInvoice({
            amount,
            comment,
            eventId,
            eventCoordinate
        });

        if (!invoice) return;

        // Start polling for receipt
        zapReceipt.startPolling(invoice);

        // If WebLN is enabled, try to pay automatically
        if (webln.isEnabled) {
            try {
                await webln.sendPayment(invoice);
            } catch (e) {
                if (e instanceof Error) {
                    showToast({ title: 'Payment Error', subtitle: e.message, type: 'error' });
                }
                zapReceipt.stopPolling();
            }
        }
    };

    const handleCopyInvoice = async () => {
        if (!zapInvoice.invoice) return;
        await copyToClipboard(zapInvoice.invoice, () => {
            showToast({ title: 'Copied to clipboard', type: 'success' });
        });
    };

    const handleClose = () => dispatch(hidePortal());

    const showQRCode = zapInvoice.invoice && !webln.isEnabled;
    const isLoading = zapInvoice.isGenerating || zapReceipt.isPolling;

    // Generate QR code when invoice changes (skip initial render)
    useUpdateEffect(() => {
        if (zapInvoice.invoice && !webln.isEnabled && qrCanvasRef.current) {
            QRCode.toCanvas(qrCanvasRef.current, zapInvoice.invoice).catch(console.error);
        }
    }, [zapInvoice.invoice, webln.isEnabled]);

    // Show WebLN error when it changes (skip initial null)
    useUpdateEffect(() => {
        if (webln.error) {
            showToast({ title: 'WebLN Error', subtitle: webln.error.message, type: 'error' });
        }
    }, [webln.error]);

    // Show zap invoice error when it changes (skip initial null)
    useUpdateEffect(() => {
        if (zapInvoice.error) {
            showToast({ title: 'Error', subtitle: zapInvoice.error.message, type: 'error' });
        }
    }, [zapInvoice.error]);

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
                        className="relative transform overflow-hidden rounded-xl bg-white dark:bg-slate-800 px-4 pb-4 pt-5 text-left shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] my-8 w-full sm:max-w-sm sm:p-6 data-closed:opacity-0 data-closed:scale-95 data-closed:-translate-y-4"
                    >
                        <DialogTitle
                            as="h2"
                            className="font-bold leading-6 text-slate-700 dark:text-slate-200 text-xl flex justify-between items-center"
                        >
                            Zap
                            <XMarkIcon
                                onClick={handleClose}
                                className="h-5 w-5 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            />
                        </DialogTitle>

                        <div className="mt-5">
                            {/* Amount display */}
                            <div className="flex my-5 w-full justify-center">
                                <h1 className="text-3xl font-bold ordinal tabular-nums text-center text-slate-700 dark:text-slate-200">
                                    {amount ?? 0}
                                </h1>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">sats</span>
                            </div>

                            {showQRCode ? (
                                <InvoiceDisplay
                                    invoice={zapInvoice.invoice!}
                                    canvasRef={qrCanvasRef}
                                    onCopy={handleCopyInvoice}
                                />
                            ) : (
                                <ZapForm
                                    register={register}
                                    errors={errors}
                                    onSubmit={handleSubmit(onSubmit)}
                                    onCancel={handleClose}
                                    isLoading={isLoading}
                                />
                            )}

                            {isLoading && (
                                <p className="text-slate-600 dark:text-slate-400 w-full text-center py-3.5 animate-pulse">
                                    {zapInvoice.isGenerating ? 'Generating invoice...' : 'Waiting for payment...'}
                                </p>
                            )}
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

// Sub-components for better organization
interface InvoiceDisplayProps {
    invoice: string;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    onCopy: () => void;
}

const InvoiceDisplay = ({ invoice, canvasRef, onCopy }: InvoiceDisplayProps) => (
    <div>
        <canvas ref={canvasRef} className="mx-auto bg-white rounded-lg" />
        <div className="flex gap-x-2 items-center justify-center my-5">
            <input
                value={invoice}
                disabled
                readOnly
                className="flex-1 block w-full border-0 rounded-lg py-2.5 px-2 text-sm text-slate-900 dark:text-slate-100 ring-2 outline-none ring-slate-200 dark:ring-slate-600 bg-slate-100 dark:bg-slate-700 leading-6"
            />
            <button
                onClick={onCopy}
                className="flex items-center justify-center p-3 border-0 rounded-lg cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
                <DocumentDuplicateIcon className="h-5 w-5" />
            </button>
        </div>
    </div>
);

interface ZapFormProps {
    register: ReturnType<typeof useForm<ZapSchemaType>>['register'];
    errors: ReturnType<typeof useForm<ZapSchemaType>>['formState']['errors'];
    onSubmit: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

const ZapForm = ({ register, errors, onSubmit, onCancel, isLoading }: ZapFormProps) => (
    <div>
        {/* Amount input */}
        <div className="relative mt-2 rounded-lg bg-slate-200 dark:bg-slate-700">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                <BoltIcon className="h-4 w-4 text-amber-500" />
            </div>
            <input
                {...register('amount')}
                className="block w-full bg-slate-100 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 rounded-lg border-0 py-3 pl-7 pr-12 text-slate-900 dark:text-slate-100 ring-2 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 text-sm sm:leading-6"
                placeholder="0"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">sats</span>
            </div>
        </div>
        {errors.amount && (
            <p className="mt-2 text-sm text-red-500">{errors.amount.message as ReactNode}</p>
        )}

        {/* Comment input */}
        <div className="mt-2">
            <textarea
                {...register('comment')}
                rows={3}
                placeholder="Add an optional message"
                className="block w-full bg-slate-100 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 rounded-lg border-0 py-1.5 text-slate-900 dark:text-slate-100 ring-2 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 text-sm sm:leading-6"
            />
        </div>
        {errors.comment && (
            <p className="mt-2 text-sm text-red-500">{errors.comment.message as ReactNode}</p>
        )}

        {/* Actions */}
        <div className="mt-1 flex justify-end">
            <button
                type="button"
                onClick={onCancel}
                className="text-sm font-semibold py-3 px-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={onSubmit}
                disabled={isLoading}
                className="border-0 bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400 py-3 px-2 text-sm rounded-lg font-semibold text-white my-3 min-w-24 transition-colors disabled:opacity-50"
            >
                Zap!
            </button>
        </div>
    </div>
);

export default ZapPortal;
