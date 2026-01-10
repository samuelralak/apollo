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
    InvitesSection,
    ProgressIndicator,
    SimilarQuestions
} from "./form";

const QuestionForm = ({ question }: { question?: Question }) => {
    const navigate = useNavigate()
    const {
        form,
        onSubmit,
        publishing,
        invitedUsers,
        inviteUser,
        removeInvitedUser,
        progress,
        draftStatus
    } = useQuestionForm(question)
    const category = form.watch('category')
    const title = form.watch('title')

    const handleCancel = () => {
        navigate(-1)
    }

    return (
        <div className="mx-auto mt-4 sm:mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:gap-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
            {/* Mobile: Progress indicator at top */}
            {!question && (
                <div className="lg:hidden">
                    <ProgressIndicator progress={progress} draftStatus={draftStatus} />
                </div>
            )}

            {/* Form fields */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-2 lg:col-start-1">
                <CategorySection form={form} defaultCategory={question?.category} />
                <TitleInput form={form} category={category} defaultTitle={question?.title} />
                <SimilarQuestions title={title} excludeId={question?.id} />
                <DetailsSection form={form} />
                <InvitesSection invitedUsers={invitedUsers} onInvite={inviteUser} onRemove={removeInvitedUser} />
                <TagsInput form={form} />
                <FormActions onSubmit={form.handleSubmit(onSubmit)} onCancel={handleCancel} publishing={publishing} />
            </div>

            {/* Sidebar: Desktop progress + guidelines */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-1">
                {/* Desktop: Progress indicator in sidebar */}
                {!question && (
                    <div className="hidden lg:block">
                        <ProgressIndicator progress={progress} draftStatus={draftStatus} />
                    </div>
                )}
                <GuidelinesPanel category={category} />
            </div>
        </div>
    )
}

export default QuestionForm
