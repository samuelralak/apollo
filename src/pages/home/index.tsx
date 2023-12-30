import {NDKEvent} from "@nostr-dev-kit/ndk";
import {useContext, useEffect, useMemo, useState} from "react";
import {NDKContext} from "../../components/NDKProvider";
import {transformer as questionTransformer} from "../../resources/question";
import Loader from "../../components/Loader";
import QuestionsList from "../../components/questions/QuestionsList";
import constants from "../../constants";

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
            {questionEvents ? (<QuestionsList questions={questions}/>) : <Loader/>}
        </div>
    )
}

export default Page;
