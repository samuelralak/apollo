import { useNavigate } from "react-router";
import type { Question } from "../types/question.types";
import useQuestionForm from "../hooks/useQuestionForm";
import {
    CategorySection,
    TitleInput,
    DetailsSection,
    TagsInput,
    GuidelinesPanel,
    FormActions,
    InvitesSection
} from "./form";

const QuestionForm = ({ question }: { question?: Question }) => {
    const navigate = useNavigate()
    const { form, onSubmit, publishing, invitedUsers, inviteUser, removeInvitedUser } = useQuestionForm(question)
    const category = form.watch('category')

    const handleCancel = () => {
        navigate(-1)
    }

    return (
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                <CategorySection form={form} defaultCategory={question?.category} />
                <TitleInput form={form} category={category} defaultTitle={question?.title} />
                <DetailsSection form={form} />
                <InvitesSection invitedUsers={invitedUsers} onInvite={inviteUser} onRemove={removeInvitedUser} />
                <TagsInput form={form} />
                <FormActions onSubmit={form.handleSubmit(onSubmit)} onCancel={handleCancel} publishing={publishing} />
            </div>
            <GuidelinesPanel category={category} />
        </div>
    )
}

export default QuestionForm
