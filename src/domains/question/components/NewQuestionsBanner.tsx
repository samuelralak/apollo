import { ArrowUpIcon } from "@heroicons/react/20/solid";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

interface NewQuestionsBannerProps {
    count: number;
    onLoad: (callback: (event: NDKEvent) => void) => void;
    onLoadCallback: (event: NDKEvent) => void;
}

const NewQuestionsBanner = ({ count, onLoad, onLoadCallback }: NewQuestionsBannerProps) => {
    if (count === 0) return null;

    const handleClick = () => {
        // Scroll to top first for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Then load the pending questions
        onLoad(onLoadCallback);
    };

    return (
        <button
            onClick={handleClick}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50
                       flex items-center gap-2 px-4 py-2
                       bg-indigo-600 hover:bg-indigo-700
                       text-white text-sm font-medium
                       rounded-full shadow-lg
                       transition-all duration-200
                       hover:shadow-xl hover:scale-105
                       animate-fade-in"
        >
            <ArrowUpIcon className="h-4 w-4" />
            <span>
                {count === 1
                    ? "1 new question"
                    : `${count} new questions`}
            </span>
        </button>
    );
};

export default NewQuestionsBanner;
