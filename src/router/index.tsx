import {createBrowserRouter} from "react-router-dom";
import Root, {HomePage, NewQuestionPage, QuestionPage} from "../pages";
import withAuthRequired from "../components/hocs/withAuthRequired.tsx";

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
                element: <QuestionPage/>
            },
            {
                path: 'questions/new',
                element: withAuthRequired(NewQuestionPage),
            }
        ]
    }
])

export default router
