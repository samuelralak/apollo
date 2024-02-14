import {createBrowserRouter, LoaderFunction} from "react-router-dom";
import Root, {EditQuestionPage, HomePage, NewQuestionPage, ProfilePage, QuestionPage} from "../pages";
import withAuthRequired from "../components/hocs/withAuthRequired";
import {validate as isUUID} from 'uuid'
import SettingsPage, {UserProfileSettingsPage} from "../pages/settings";

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
                    }
                ]

            },
            {
                path: 'user/:pubkey',
                element: <ProfilePage/>,
            }
        ]
    }
])

export default router
