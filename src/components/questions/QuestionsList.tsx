import Question from "../../resources/question";
import {Link} from "react-router-dom";
import {memo} from "react";
import {formatDateTime, markdownToText} from "../../utils";
import EventOwner from "../shared/EventOwner";
import QuestionStats from "./QuestionStats";
import ActionItems from "../shared/ActionItems";

const QuestionsList = memo(({questions}: { questions: Question[] }) => {
    return (
        <div className="flex flex-col divide-y divide-slate-200 gap-y-3.5">
            {questions.map((question) => (
                <div className="flex flex-col sm:flex-row gap-x-6 pt-3.5 w-full flex-nowrap" key={question.eventId}>
                    <QuestionStats/>

                    <div className="flex flex-1 flex-col w-full gap-y-2.5">
                        <div className="w-full overflow-hidden">
                            <Link to={`/questions/${question.id}`} className="text-lg font-semibold text-slate-700">
                                {question.title}
                            </Link>

                            <div className="flex gap-x-2 mt-1 mb-3 max-w-64 sm:max-w-full flex-wrap gap-y-2">
                                {question.tags && question.tags.map((tag, index) => (
                                    <span
                                        key={`${question.id}-${tag}-${index} `}
                                        className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 min-w-max"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <p className="mt-2 line-clamp-2 text-sm text-slate-600 w-full">
                                {markdownToText(question.description)}
                            </p>
                        </div>


                        <div className="flex flex-row align-top justify-between items-center">
                            <div className="flex flex-row items-center gap-x-2">
                                <EventOwner pubkey={question.user.pubkey} mini={true}/>
                                <span className="text-sm font-medium text-slate-500 align-top">
                                    asked {formatDateTime(question.createdAt)}
                                </span>
                            </div>

                            <ActionItems id={question.id} eventId={question.eventId} pubkey={question.user.pubkey}/>
                        </div>
                    </div>
                </div>
            ))}
        </div>

    )
})

QuestionsList.displayName = 'QuestionList'

export default QuestionsList
