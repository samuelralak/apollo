import NoQuestion from "../../assets/no-questions.svg";

const EmptyState = () => (
    <div className="mx-auto max-w-3xl">
        <div>
            <img src={NoQuestion} alt={'placeholder'} className="h-72 w-72 mx-auto"/>
            <h1 className="text-2xl text-slate-600 font-extrabold w-full text-center">
                Got a question? Ask Away!
            </h1>
            <p className="text-lg w-full text-center font-semibold max-w-xl mx-auto text-slate-400">
                The Apollo community is here to help. Your curiosity fuels our collaborative spirit
            </p>
        </div>
    </div>
)

export default EmptyState
