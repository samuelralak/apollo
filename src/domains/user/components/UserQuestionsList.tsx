import {Link} from "react-router";
import type {Question} from "../../question/types/question.types";
import {formatDateTime} from "../../../utils";

interface UserQuestionsListProps {
    questions: Question[];
    loading?: boolean;
}

const UserQuestionsListSkeleton = () => (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="py-4 animate-pulse">
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="flex items-center gap-4 mt-2">
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="flex gap-2 mt-2">
                    <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
            </div>
        ))}
    </div>
);

const UserQuestionsList = ({questions, loading}: UserQuestionsListProps) => {
    if (loading) {
        return <UserQuestionsListSkeleton />;
    }

    if (questions.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No questions yet
            </div>
        );
    }

    // Sort by createdAt descending (newest first)
    const sortedQuestions = [...questions].sort(
        (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );

    return (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedQuestions.map(question => (
                <div key={question.id} className="py-4">
                    <Link
                        to={`/questions/${question.id}`}
                        className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                    >
                        {question.title}
                    </Link>

                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>{formatDateTime(question.createdAt)}</span>
                    </div>

                    {question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {question.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default UserQuestionsList;
