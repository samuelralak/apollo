import {createBrowserRouter} from "react-router-dom";
import Root, {HomePage, NewQuestionPage, QuestionPage} from "../pages";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                index: true,
                element: <HomePage/>
            },
            {
                path: 'questions/:questionId',
                element: <QuestionPage />
            },
            {
                path: 'questions/new',
                element: <NewQuestionPage />
            }
        ]
    }
])

export default router
