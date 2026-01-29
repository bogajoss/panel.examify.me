import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getQuestionById, getFileById } from "@/lib/actions";
import { getImageUrl } from "@/lib/utils";
import { Breadcrumb } from "@/components/layout";
import { Card, CardContent, Button } from "@/components/ui";
import { answerToLetter, SECTION_LABELS, type SectionTypeValue } from "@/types";
import Link from "next/link";
import { Edit2, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface QuestionPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Question | AntiGravity Question Bank",
};

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { user } = await requireAuth();
  const isAdmin = user.role === "admin";

  const { id } = await params;
  const result = await getQuestionById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const question = result.data;

  // Get file info
  const fileResult = await getFileById(question.fileId);
  const file = fileResult.success ? fileResult.data : null;

  const options = [
    { label: "A", value: question.option1 },
    { label: "B", value: question.option2 },
    { label: "C", value: question.option3 },
    { label: "D", value: question.option4 },
    { label: "E", value: question.option5 },
  ].filter((opt) => opt.value);

  const answerLetter = answerToLetter(question.answer);
  const sectionLabel =
    SECTION_LABELS[question.section as SectionTypeValue] || question.section;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Files", href: "/files" },
          {
            label: file?.displayName || file?.originalFilename || "File",
            href: `/files/${question.fileId}`,
          },
          { label: `Question ${question.orderIndex + 1}` },
        ]}
      />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Question {question.orderIndex + 1}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            {question.type > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                Type {question.type}
              </span>
            )}
            {question.section !== "0" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                {sectionLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/files/${question.fileId}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to File
            </Button>
          </Link>
          {isAdmin && (
            <Link href={`/questions/${id}/edit`}>
              <Button>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Question Image */}
          {question.questionImageId && (
            <div>
              <img
                src={getImageUrl(question.questionImageId)}
                alt="Question"
                className="max-h-64 rounded-lg border"
              />
            </div>
          )}

          {/* Question Text */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Question</h2>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: question.questionText }}
            />
          </div>

          {/* Options */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">Options</h2>
            <div className="space-y-2">
              {options.map((opt) => (
                <div
                  key={opt.label}
                  className={`p-4 rounded-lg border ${
                    opt.label === answerLetter
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span
                    className={`font-semibold mr-3 ${
                      opt.label === answerLetter
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    {opt.label}.
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: opt.value }} />
                  {opt.label === answerLetter && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Correct Answer
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Answer */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Answer</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-lg font-medium bg-green-100 text-green-800">
              {answerLetter || question.answer || "N/A"}
            </span>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-2">
                Explanation
              </h2>

              {question.explanationImageId && (
                <div className="mb-3">
                  <img
                    src={getImageUrl(question.explanationImageId)}
                    alt="Explanation"
                    className="max-h-64 rounded-lg border"
                  />
                </div>
              )}

              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: question.explanation }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
