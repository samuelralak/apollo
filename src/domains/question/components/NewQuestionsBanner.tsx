import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowUp01Icon} from "@hugeicons-pro/core-twotone-rounded";
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
                       bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400
                       text-white text-sm font-medium
                       rounded-full shadow-lg
                       transition-all duration-200
                       hover:shadow-xl hover:scale-105
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600
                       animate-fade-in"
        >
            <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
            <span>
                {count === 1
                    ? "1 new question"
                    : `${count} new questions`}
            </span>
        </button>
    );
};

export default NewQuestionsBanner;
