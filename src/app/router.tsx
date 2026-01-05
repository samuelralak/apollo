import {createBrowserRouter, LoaderFunction} from "react-router";
import Root from "./Root";
import {HomePage, QuestionPage, NewQuestionPage, EditQuestionPage} from "../domains/question/pages";
import {ProfilePage} from "../domains/user/pages";
import {AboutPage} from "../domains/website/pages";
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
            }
        ]
    }
])

export default router
