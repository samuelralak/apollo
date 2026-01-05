import type {Answer} from "../types/answer.types";
import {CheckCircleIcon} from "@heroicons/react/24/solid";
import {useContext, useState} from "react";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import constants from "../../../constants";
import {CogIcon} from "@heroicons/react/24/outline";

const AcceptAnswer = ({answer}: { answer: Answer }) => {
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
            {isLoading ? (<CogIcon className="animate-spin h-6 w-6 text-slate-400 dark:text-slate-500"/>) : (
                <CheckCircleIcon
                    className="text-slate-300 dark:text-slate-600 hover:text-green-500 dark:hover:text-green-400 h-6 w-6 cursor-pointer transition-colors"
                />
            )}
        </button>
    )
}

export default AcceptAnswer
