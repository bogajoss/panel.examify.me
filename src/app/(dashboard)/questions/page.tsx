import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";
import { QuestionList } from "@/components/questions";
import { Breadcrumb } from "@/components/layout";
import { LoadingPage } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Questions | AntiGravity Question Bank",
};

export default async function QuestionsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Questions" }]} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Questions</h1>
        <p className="text-gray-600 mt-1">
          Search and filter questions across all files.
        </p>
      </div>

      <Suspense fallback={<LoadingPage message="Loading questions..." />}>
        <QuestionList />
      </Suspense>
    </div>
  );
}
