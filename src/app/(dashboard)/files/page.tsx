import Link from "next/link";
import { Suspense } from "react";
import { requireAuth, isAdmin as checkIsAdmin } from "@/lib/auth";
import { FileList } from "@/components/files";
import { Breadcrumb } from "@/components/layout";
import { Button, LoadingPage } from "@/components/ui";
import { Upload } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Files | AntiGravity Question Bank",
};

export default async function FilesPage() {
  await requireAuth();
  const isAdmin = await checkIsAdmin();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Files" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Banks</h1>
          <p className="text-gray-600 mt-1">
            Browse and manage your uploaded question files.
          </p>
        </div>

        {isAdmin && (
          <Link href="/admin/upload">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<LoadingPage message="Loading files..." />}>
        <FileList />
      </Suspense>
    </div>
  );
}
