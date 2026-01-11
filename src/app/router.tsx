import {createBrowserRouter, LoaderFunction} from "react-router";
import {lazy, Suspense} from "react";
import Root from "./Root";
import {HomePage, QuestionPage, NewQuestionPage, EditQuestionPage} from "../domains/question/pages";
import {ProfilePage} from "../domains/user/pages";
import {BookmarksPage} from "../domains/bookmark/pages";
import {AboutPage, PrivacyPolicyPage, TermsOfUsePage} from "../domains/website/pages";
import {
    SettingsPage,
    UserProfileSettingsPage,
    NetworkSettingsPage,
    NotificationsSettingsPage,
    SecuritySettingsPage,
    TranslationSettingsPage,
    AppearanceSettingsPage
} from "../domains/user/pages/settings";
import withAuthRequired from "../domains/auth/components/withAuthRequired";
import {validate as isUUID} from 'uuid'

// Lazy load notifications page for better initial bundle size
const NotificationsPage = lazy(() => import("../domains/notification/pages/NotificationsPage"));

const uuidLoader: LoaderFunction = ({params}) => {
    const {questionId} = params;

    if (!questionId || !isUUID(questionId)) {
        throw new Response("Not Found", {status: 404});
    }

    return {};
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root/>,
        children: [
            {
                index: true,
                element: <HomePage/>
            },
            {
                path: 'questions/:questionId',
                element: <QuestionPage/>,
                loader: uuidLoader
            },
            {
                path: 'questions/:questionId/edit',
                element: withAuthRequired(EditQuestionPage),
                loader: uuidLoader
            },
            {
                path: 'questions/new',
                element: withAuthRequired(NewQuestionPage),
            },
            {
                path: 'bookmarks',
                element: withAuthRequired(BookmarksPage),
            },
            {
                path: 'notifications',
                element: (
                    <Suspense fallback={<div className="max-w-3xl animate-pulse"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" /><div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="flex gap-3 py-4"><div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" /><div className="flex-1"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" /><div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-1/2" /></div></div>)}</div></div>}>
                        {withAuthRequired(NotificationsPage)}
                    </Suspense>
                ),
            },
            {
                path: 'settings/',
                element: withAuthRequired(SettingsPage),
                children: [
                    {
                        path: "user-profile",
                        element: <UserProfileSettingsPage />,
                    },
                    {
                        path: "network",
                        element: <NetworkSettingsPage />,
                    },
                    {
                        path: "notifications",
                        element: <NotificationsSettingsPage />,
                    },
                    {
                        path: "security",
                        element: <SecuritySettingsPage />,
                    },
                    {
                        path: "translation",
                        element: <TranslationSettingsPage />,
                    },
                    {
                        path: "appearance",
                        element: <AppearanceSettingsPage />,
                    }
                ]

            },
            {
                path: 'user/:pubkey',
                element: <ProfilePage/>,
            },
            {
                path: 'about',
                element: <AboutPage/>,
            },
            {
                path: 'privacy',
                element: <PrivacyPolicyPage/>,
            },
            {
                path: 'terms',
                element: <TermsOfUsePage/>,
            }
        ]
    }
])

export default router
