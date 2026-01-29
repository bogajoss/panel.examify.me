import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAuth, isAdmin as checkIsAdmin } from "@/lib/auth";
import { getFileById } from "@/lib/actions";
import { QuestionList } from "@/components/questions";
import { Breadcrumb } from "@/components/layout";
import { 
  Button, 
  LoadingPage, 
  Card, 
  CardContent, 
  Badge,
  Separator
} from "@/components/ui";
import { Plus, Upload, Database, FileText, Calendar, Hash, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface FilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: FilePageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getFileById(id);
  
  if (!result.success || !result.data) {
    return { title: "File Not Found | AntiGravity Question Bank" };
  }

  return {
    title: `${result.data.displayName || result.data.originalFilename} | AntiGravity Question Bank`,
  };
}

export default async function FilePage({ params }: FilePageProps) {
  await requireAuth();
  const isAdmin = await checkIsAdmin();

  const { id } = await params;
  const result = await getFileById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const file = result.data;

  return (
    <div className="space-y-8 pb-20">
      <Breadcrumb
        showBack
        backHref="/files"
        items={[
          { label: "Collections", href: "/files" },
          { label: file.displayName || file.originalFilename },
        ]}
      />

      {/* File Header & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {file.displayName || file.originalFilename}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="font-semibold uppercase tracking-wider text-[10px]">Collection</Badge>
                <span className="text-sm text-muted-foreground font-mono uppercase tracking-widest">{file.$id.slice(-8)}</span>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Link href={`/files/${id}/add`} className="flex-1 lg:flex-none">
              <Button variant="outline" className="w-full h-11 px-6 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Individual Add
              </Button>
            </Link>
            <Link href={`/admin/upload?merge=${id}`} className="flex-1 lg:flex-none">
              <Button className="w-full h-11 px-6 shadow-md shadow-primary/20">
                <Upload className="h-4 w-4 mr-2" />
                Batch Merge (CSV)
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* File Metadata Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-muted/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 bg-background rounded-xl shadow-sm">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Original Name</p>
              <p className="text-sm font-semibold truncate max-w-[150px]">{file.originalFilename}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-muted/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 bg-background rounded-xl shadow-sm">
              <Hash className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Question Count</p>
              <p className="text-sm font-semibold">{file.totalQuestions} items</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-muted/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 bg-background rounded-xl shadow-sm">
              <Calendar className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Uploaded On</p>
              <p className="text-sm font-semibold">{formatDate(file.uploadedAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-muted/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 bg-background rounded-xl shadow-sm">
              <Plus className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Created By</p>
              <p className="text-sm font-semibold capitalize">{isAdmin ? "Administrator" : "User"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-10" />

      {/* Questions Header */}
      <div className="space-y-1 mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Question List</h2>
        <p className="text-muted-foreground">Explore and manage questions in this collection.</p>
      </div>

      {/* Questions List */}
      <Suspense fallback={<LoadingPage message="Loading questions..." />}>
        <QuestionList fileId={id} />
      </Suspense>
    </div>
  );
}
