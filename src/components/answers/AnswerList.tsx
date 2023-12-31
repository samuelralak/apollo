import {Answer} from "../../resources/answer.ts";
import AnswerItem from "./AnswerItem.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import {Fragment} from "react";

const AnswerList = ({answers}: { answers: Answer[] }) => {
    const pubkey = useSelector((state: RootState) => state.auth).pubkey;

    return (
        <div className="mb-5">
            <h1 className="text-lg font-bold text-slate-600">{answers.length ?? 0} Answers</h1>

            {answers.length === 0 ? (
                <div className="bg-slate-50 rounded-lg w-full h-20 flex items-center justify-center mt-3">
                    <p className="font-semibold text-lg text-slate-400 text-center">
                        No answers? Your insights could be the missing piece!
                    </p>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-slate-200 gap-y-4">
                    {answers.length > 0 && answers.map((answer) => (
                        <Fragment key={answer.id}>
                            {answer.user.pubkey !== pubkey && (<AnswerItem answer={answer}/>)}
                        </Fragment>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AnswerList
