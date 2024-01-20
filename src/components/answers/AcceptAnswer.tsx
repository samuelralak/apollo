import {Answer} from "../../resources/answer.ts";
import {CheckCircleIcon} from "@heroicons/react/24/solid";
import {useContext} from "react";
import {NDKContext} from "../NDKProvider.tsx";
import constants from "../../constants";
import {classNames} from "../../utils";

const AcceptAnswer = ({answer, isAccepted}: { answer: Answer, isAccepted?: boolean }) => {
    const {ndkInstance, publishEvent} = useContext(NDKContext) as NDKContext

    const handleMarkAcceptedAnswer = async () => {
        const questionEvent = await ndkInstance().fetchEvent({
            kinds: [constants.questionKind],
            "#d": [answer.questionId]
        })

        if (questionEvent) {
            await publishEvent(constants.questionKind, questionEvent.content, [
                ...questionEvent.tags,
                ...[
                    ["accepted_answer", answer.eventId],
                    ["a", `${constants.answerKind}:${answer.user.pubkey}:${answer.id}`, ""]
                ]
            ])
        }
    }

    return (
        <button onClick={handleMarkAcceptedAnswer}>
            <CheckCircleIcon
                className={classNames(isAccepted ? 'text-green-500' : 'text-slate-300 hover:text-slate-400', 'h-6 w-6 cursor-pointer')}
            />
        </button>
    )
}

export default AcceptAnswer
