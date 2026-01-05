import {Link} from "react-router";
import type {Answer} from "../../answer/types/answer.types";
import {formatDateTime} from "../../../utils";

interface UserAnswersListProps {
    answers: Answer[];
    loading?: boolean;
}

const UserAnswersListSkeleton = () => (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="py-4 animate-pulse">
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="flex items-center gap-4 mt-2">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
            </div>
        ))}
    </div>
);

const UserAnswersList = ({answers, loading}: UserAnswersListProps) => {
    if (loading) {
        return <UserAnswersListSkeleton />;
    }

    if (answers.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No answers yet
            </div>
        );
    }

    // Sort by createdAt descending (newest first)
    const sortedAnswers = [...answers].sort(
        (a, b) => b.createdAt - a.createdAt
    );

    return (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedAnswers.map(answer => (
                <div key={answer.id || answer.eventId} className="py-4">
                    <Link
                        to={`/questions/${answer.questionId}`}
                        className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                    >
                        View Question
                    </Link>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {answer.description.slice(0, 200)}
                        {answer.description.length > 200 ? '...' : ''}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>{formatDateTime(answer.createdAt)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserAnswersList;
