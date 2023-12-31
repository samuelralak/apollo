import {NDKEvent} from "@nostr-dev-kit/ndk";
import {useContext, useEffect, useMemo, useState} from "react";
import {NDKContext} from "../../components/NDKProvider";
import {transformer as questionTransformer} from "../../resources/question";
import Loader from "../../components/Loader";
import QuestionsList from "../../components/questions/QuestionsList";
import constants from "../../constants";
import NoQuestion from '../../assets/no-questions.svg'

const Page = () => {
    const {ndkInstance} = useContext(NDKContext) as NDKContext
    const [questionEvents, setQuestionEvents] = useState<NDKEvent[] | undefined>(undefined)

    console.log(constants.questionKind)
    const questions = useMemo(() => {
        return (questionEvents ?? []).map(questionTransformer)
    }, [questionEvents])

    useEffect(() => {
        (async () => {
            const questionEvents = await ndkInstance().fetchEvents({kinds: [constants.questionKind], limit: 1000})
            setQuestionEvents([...questionEvents])
        })()
    }, [ndkInstance]);

    return (
        <div className="mx-auto max-w-3xl">
            {questionEvents && questionEvents.length === 0 && (
                <div>
                    <img src={NoQuestion} alt={'placeholder'} className="h-72 w-72 mx-auto"/>
                    <h1 className="text-2xl text-slate-600 font-extrabold w-full text-center">
                        Got a question? Ask Away!
                    </h1>
                    <p className="text-lg w-full text-center font-semibold max-w-xl mx-auto text-slate-400">
                        The Apollo community is here to help. Your curiosity fuels our collaborative spirit
                    </p>
                </div>
            )}

            {questionEvents ? (<QuestionsList questions={questions}/>) : <Loader/>}
        </div>
    )
}

export default Page;
