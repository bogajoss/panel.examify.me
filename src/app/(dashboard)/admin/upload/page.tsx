import { requireAdmin } from "@/lib/auth";
import { getFileById } from "@/lib/actions";
import { CSVUploadForm } from "@/components/forms";
import { MergeCSVForm } from "@/components/forms/MergeCSVForm";
import { Breadcrumb } from "@/components/layout";
import { Card, CardContent } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload CSV | AntiGravity Question Bank",
};

interface UploadPageProps {
  searchParams: Promise<{ merge?: string }>;
}

export default async function UploadPage({ searchParams }: UploadPageProps) {
  await requireAdmin();

  const { merge: mergeFileId } = await searchParams;
  let mergeFile = null;

  if (mergeFileId) {
    const result = await getFileById(mergeFileId);
    if (result.success && result.data) {
      mergeFile = result.data;
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: mergeFile ? "Merge CSV" : "Upload CSV" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {mergeFile ? "Merge CSV" : "Upload CSV"}
        </h1>
        <p className="text-gray-600 mt-1">
          {mergeFile
            ? `Add more questions to "${mergeFile.displayName || mergeFile.originalFilename}"`
            : "Upload a new CSV file to create a question bank."}
        </p>
      </div>

      {mergeFile ? (
        <MergeCSVForm file={mergeFile} />
      ) : (
        <CSVUploadForm />
      )}

      {/* Tips */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ensure your CSV is UTF-8 encoded</li>
                <li>Use column headers in the first row</li>
                <li>The &quot;questions&quot; or &quot;question&quot; column is required</li>
                <li>HTML formatting is preserved in question and explanation text</li>
                <li>Enable zero-indexed conversion if answers use 0-3 instead of 1-4</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
