interface Props {
    onSubmit: () => void;
    onCancel: () => void;
    publishing: boolean;
}

const FormActions = ({onSubmit, onCancel, publishing}: Props) => {
    return (
        <div className="mt-6 flex items-center justify-end gap-x-6 border-t border-slate-200 dark:border-slate-700 pt-6">
            <button
                disabled={publishing}
                type="button"
                onClick={onCancel}
                className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300 disabled:text-slate-400 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={publishing}
                onClick={onSubmit}
                className="rounded-lg bg-teal-600 dark:bg-teal-500 px-3 py-3.5 text-sm font-semibold text-white disabled:bg-slate-400 disabled:text-slate-300 hover:bg-teal-700 dark:hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-colors"
            >
                {publishing ? 'Publishing...' : 'Publish your question'}
            </button>
        </div>
    )
}

export default FormActions
