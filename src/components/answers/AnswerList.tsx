import {PlayIcon} from "@heroicons/react/24/outline";
import {Answer} from "../../resources/answer.ts";
import MDEditor from "@uiw/react-md-editor";

const AnswerList = ({answers}: { answers: Answer[] }) => {
    console.log({answers})

    return (
        <div className="mb-5">
            <h1 className="text-xl font-medium text-slate-600">{answers.length ?? 0} Answers</h1>

            <div className="flex flex-col divide-y divide-slate-200 gap-y-4">
                {answers.length > 0 && answers.map((answer) => (
                    <div className="flex flex-row gap-x-4 pt-4" key={answer.id}>
                        <div className="w-10 flex flex-col items-center">
                            <PlayIcon className="h-6 -rotate-90 text-slate-400"/>
                            <p className="w-full text-center font-semibold text-xl text-slate-600">1</p>
                            <PlayIcon className="h-6 rotate-90 text-slate-400"/>
                        </div>
                        <div className="flex-1">
                            <div className="question-detail">
                                <MDEditor.Markdown
                                    source={answer?.description ?? ''}
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        backgroundColor: 'white',
                                        color: '#334155',
                                        fontFamily: 'Poppins, sans-serif'
                                    }}
                                    data-color-mode={'light'}
                                    className="bg-white font-normal text-slate-700 prose prose-slate max-w-3xl"
                                />
                            </div>


                            <div className="flex flex-row py-3 align-middle justify-center">
                                <a href="#" className="group block flex-shrink-0 flex-1">
                                    <div className="flex items-center">
                                        <div>
                                            <img
                                                className="inline-block h-9 w-9 rounded-lg"
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                alt=""
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Tom
                                                Cook</p>
                                            <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700">View
                                                profile</p>
                                        </div>
                                    </div>
                                </a>
                                <div>
                                    <dl className="text-right text-sm">
                                        <dt>asked</dt>
                                        <dd>6 hours ago</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AnswerList
