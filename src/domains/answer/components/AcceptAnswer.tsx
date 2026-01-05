import type {Answer} from "../types/answer.types";
import type {Question} from "../../question/types/question.types";
import {HugeiconsIcon} from "@hugeicons/react";
import {CheckmarkCircle02Icon, Settings02Icon} from "@hugeicons-pro/core-twotone-rounded";
import {useContext, useState} from "react";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import constants from "../../../constants";

const AcceptAnswer = ({answer, question}: { answer: Answer, question: Question }) => {
    const {publishEvent} = useContext(NDKContext) as NDKContext
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleMarkAcceptedAnswer = async () => {
        setIsLoading(true)

        // Reconstruct tags from Question data - no network fetch needed
        const tags: string[][] = [
            ["d", question.id],
            ["title", question.title],
            ...question.tags.map(t => ["t", t]),
            ["L", "question-category"],
            ["l", question.category, "question-category"],
            ["accepted_answer", answer.eventId],
            ["a", `${constants.answerKind}:${answer.user.pubkey}:${answer.id}`, ""]
        ];

        await publishEvent(constants.questionKind, question.description, tags);
        setIsLoading(false)
    }

    return (
        <button onClick={handleMarkAcceptedAnswer} disabled={isLoading}>
            {isLoading ? (
                <HugeiconsIcon icon={Settings02Icon} className="animate-spin text-slate-400 dark:text-slate-500" size={24} />
            ) : (
                <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="text-slate-300 dark:text-slate-600 hover:text-green-500 dark:hover:text-green-400 cursor-pointer transition-colors"
                    size={24}
                />
            )}
        </button>
    )
}

export default AcceptAnswer
