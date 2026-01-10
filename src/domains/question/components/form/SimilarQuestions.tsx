import { Link } from "react-router";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import useSimilarQuestions from "../../hooks/useSimilarQuestions";

interface Props {
    title: string;
    excludeId?: string;
}

const SimilarQuestions = ({ title, excludeId }: Props) => {
    const { similarQuestions, isSearching } = useSimilarQuestions(title, { excludeId })

    // Don't render anything if not searching or no results
    if (!isSearching || similarQuestions.length === 0) {
        return null
    }

    return (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 ring-1 ring-amber-200 dark:ring-amber-800">
            <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Similar questions found
                    </h4>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                        Check if your question has already been asked:
                    </p>
                    <ul className="mt-3 space-y-2">
                        {similarQuestions.map(({ question, score }) => (
                            <li key={question.id} className="group">
                                <Link
                                    to={`/questions/${question.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100"
                                >
                                    <span className="text-amber-400 dark:text-amber-500">•</span>
                                    <span className="group-hover:underline underline-offset-2 line-clamp-2">
                                        {question.title}
                                    </span>
                                    <span className="text-xs text-amber-500 dark:text-amber-400 flex-shrink-0">
                                        {Math.round(score * 100)}% match
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default SimilarQuestions
