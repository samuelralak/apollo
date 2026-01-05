import type {Question} from "../../question/types/question.types";
import type {Answer} from "../../answer/types/answer.types";

export interface UserStats {
    reputation: number;
    questionsCount: number;
    answersCount: number;
    votesReceived: {
        upvotes: number;
        downvotes: number;
        total: number;
    };
    acceptedAnswers: number;
}

export interface ActivityDay {
    date: string;  // YYYY-MM-DD format
    count: number;
    level: 0 | 1 | 2 | 3 | 4;  // intensity level for heatmap
}

export interface UserActivity {
    days: ActivityDay[];
    totalContributions: number;
}

export interface UserProfileData {
    questions: Question[];
    answers: Answer[];
    stats: UserStats;
    activity: UserActivity;
}
