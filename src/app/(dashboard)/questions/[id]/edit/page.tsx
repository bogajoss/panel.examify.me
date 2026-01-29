import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getQuestionById, getFileById } from "@/lib/actions";
import { QuestionForm } from "@/components/forms";
import { Breadcrumb } from "@/components/layout";
import type { Metadata } from "next";

interface EditQuestionPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Question | AntiGravity Question Bank",
};

export default async function EditQuestionPage({
  params,
}: EditQuestionPageProps) {
  await requireAdmin();

  const { id } = await params;
  const result = await getQuestionById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const question = result.data;

  // Get file info
  const fileResult = await getFileById(question.fileId);
  const file = fileResult.success ? fileResult.data : null;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Files", href: "/files" },
          {
            label: file?.displayName || file?.originalFilename || "File",
            href: `/files/${question.fileId}`,
          },
          { label: "Edit Question" },
        ]}
      />

      <QuestionForm
        fileId={question.fileId}
        question={{
          $id: question.$id,
          questionText: question.questionText,
          option1: question.option1,
          option2: question.option2,
          option3: question.option3,
          option4: question.option4,
          option5: question.option5,
          answer: question.answer,
          explanation: question.explanation,
          type: question.type,
          section: question.section,
          questionImageId: question.questionImageId,
          explanationImageId: question.explanationImageId,
        }}
      />
    </div>
  );
}
