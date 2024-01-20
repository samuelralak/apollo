import {Answer} from "../../resources/answer.ts";
import {CheckCircleIcon} from "@heroicons/react/24/solid";
import {useContext, useState} from "react";
import {NDKContext} from "../NDKProvider.tsx";
import constants from "../../constants";
import {classNames} from "../../utils";
import {CogIcon} from "@heroicons/react/24/outline";

const AcceptAnswer = ({answer, isAccepted}: { answer: Answer, isAccepted?: boolean }) => {
    const {ndkInstance, publishEvent} = useContext(NDKContext) as NDKContext
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleMarkAcceptedAnswer = async () => {
        setIsLoading(true)
        const questionEvent = await ndkInstance().fetchEvent({
            kinds: [constants.questionKind],
            "#d": [answer.questionId]
        })

        if (questionEvent) {
            await publishEvent(constants.questionKind, questionEvent.content, [
                ...questionEvent.tags.filter((tag) => ["a", "accepted_answer"].indexOf(tag[0]) === -1),
                ...[
                    ["accepted_answer", answer.eventId],
                    ["a", `${constants.answerKind}:${answer.user.pubkey}:${answer.id}`, ""]
                ]
            ])
        }

        setIsLoading(false)
    }

    return (
        <button onClick={handleMarkAcceptedAnswer} disabled={isLoading}>
            {isLoading ? (<CogIcon className="animate-spin h-6 w-6 text-slate-200"/>) : (
                <CheckCircleIcon
                    className={classNames(isAccepted ? 'text-green-500' : 'text-slate-300 hover:text-slate-400', 'h-6 w-6 cursor-pointer')}
                />
            )}
        </button>
    )
}

export default AcceptAnswer
