import type {Question} from "../types/question.types";
import {memo} from "react";
import QuestionListItemB from "./QuestionListItemB";

interface QuestionsListProps {
    questions: Question[];
}

const QuestionsList = memo(({questions}: QuestionsListProps) => {
    return (
        <div>
            {/* Header - minimal, no border */}
            <div className="mb-2">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                </span>
            </div>

            {/* Questions list */}
            <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                {questions.map((question) => (
                    <QuestionListItemB
                        key={question.eventId}
                        question={question}
                        showPreview={true}
                    />
                ))}
            </ul>
        </div>
    );
});

QuestionsList.displayName = 'QuestionsList';

export default QuestionsList;
