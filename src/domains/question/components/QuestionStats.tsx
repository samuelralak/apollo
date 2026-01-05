const QuestionStats = () => {
    return (
        <div className="flex flex-row sm:flex-col gap-x-2 mb-0 sm:mb-1.5">
            <div className="flex justify-center items-center mx-0 sm:mx-auto p-0 sm:p-2">
                <dl className="text-center text-sm sm:text-xs font-medium inline-flex sm:block gap-x-1">
                    <dt>0</dt>
                    <dd>votes</dd>
                </dl>
            </div>
            <div
                className="flex justify-center items-center mx-0 sm:mx-auto p-0 sm:p-2 border-0 sm:border-2 border-slate-200 rounded-lg">
                <dl className="text-center text-sm sm:text-xs font-medium inline-flex sm:block gap-x-1">
                    <dt>0</dt>
                    <dd>answers</dd>
                </dl>
            </div>
            <div className="flex justify-center items-center mx-0 sm:mx-auto p-0 sm:p-2">
                <dl className="text-center text-sm sm:text-xs font-medium inline-flex sm:block gap-x-1">
                    <dt>0</dt>
                    <dd>sats</dd>
                </dl>
            </div>
        </div>
    )
}

export default QuestionStats
