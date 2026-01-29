import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getFileById } from "@/lib/actions";
import { QuestionForm } from "@/components/forms";
import { Breadcrumb } from "@/components/layout";
import type { Metadata } from "next";

interface AddQuestionPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Add Question | AntiGravity Question Bank",
};

export default async function AddQuestionPage({
  params,
}: AddQuestionPageProps) {
  await requireAdmin();

  const { id } = await params;
  const result = await getFileById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const file = result.data;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Files", href: "/files" },
          {
            label: file.displayName || file.originalFilename,
            href: `/files/${id}`,
          },
          { label: "Add Question" },
        ]}
      />

      <QuestionForm fileId={id} />
    </div>
  );
}
