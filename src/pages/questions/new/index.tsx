import QuestionForm from "../../../components/questions/QuestionForm.tsx";

const Page = () => {
    return (
        <div className="mx-auto max-w-7xl">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Ask a public question
                    </h2>
                </div>
            </div>

            <QuestionForm/>
        </div>
    )
}

export default Page
