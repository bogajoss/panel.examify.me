import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getFiles, getQuestions } from "@/lib/actions";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { 
  Files, 
  FileQuestion, 
  Upload, 
  TrendingUp, 
  ChevronRight, 
  Plus,
  Clock,
  ArrowUpRight,
  Shield
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | AntiGravity Question Bank",
};

export default async function DashboardPage() {
  const { user } = await requireAuth();
  const isAdmin = user.role === "admin";

  // Fetch stats
  const filesResult = await getFiles({ pageSize: 1 });
  const questionsResult = await getQuestions({ pageSize: 1 });

  const totalFiles = filesResult.success ? filesResult.data?.total || 0 : 0;
  const totalQuestions = questionsResult.success ? questionsResult.data?.total || 0 : 0;

  // Get recent files
  const recentFilesResult = await getFiles({ pageSize: 5, sortBy: "uploaded", sortOrder: "desc" });
  const recentFiles = recentFilesResult.success ? recentFilesResult.data?.documents || [] : [];

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Welcome, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage and explore your question bank with ease.
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-3">
            <Link href="/admin/upload">
              <Button size="lg" className="shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5 mr-2" />
                Upload New CSV
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Files</p>
                <p className="text-3xl font-bold mt-1">{totalFiles}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Files className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-blue-600/70 dark:text-blue-400/70">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>System wide</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-md bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Questions</p>
                <p className="text-3xl font-bold mt-1">{totalQuestions}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <FileQuestion className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-600/70 dark:text-emerald-400/70">
              <Plus className="h-3 w-3 mr-1" />
              <span>Available for use</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-md bg-gradient-to-br from-violet-500/10 to-violet-500/5 dark:from-violet-500/20 dark:to-violet-500/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400">Avg Q/File</p>
                <p className="text-3xl font-bold mt-1">
                  {totalFiles > 0 ? Math.round(totalQuestions / totalFiles) : 0}
                </p>
              </div>
              <div className="p-2 bg-violet-500/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-violet-600/70 dark:text-violet-400/70">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>Richness score</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-md bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Account Type</p>
                <p className="text-3xl font-bold mt-1 capitalize">{user.role || "User"}</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-xl">
                {isAdmin ? "👑" : "👤"}
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-600/70 dark:text-amber-400/70">
              <Shield className="h-3 w-3 mr-1" />
              <span>Secure access</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Files */}
        <Card className="lg:col-span-2 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-2xl">Recent Files</CardTitle>
              <CardDescription>Latest uploads to the question bank</CardDescription>
            </div>
            <Link href="/files">
              <Button variant="outline" size="sm" className="group">
                View All
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg border border-dashed">
                <Files className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">No files uploaded yet</p>
                {isAdmin && (
                  <Link href="/admin/upload" className="mt-4">
                    <Button variant="secondary" size="sm">
                      Upload your first file
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {recentFiles.map((file) => (
                  <Link
                    key={file.$id}
                    href={`/files/${file.$id}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Files className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">
                          {file.displayName || file.originalFilename}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                          <Badge variant="secondary" className="font-normal">
                            {file.totalQuestions} questions
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(file.uploadedAt).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Plus className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Quick Search</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Find questions across all your files instantly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/questions">
                <Button variant="secondary" className="w-full font-bold">
                  Start Searching
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Common Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link href="/files">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 px-4">
                  <Files className="h-5 w-5 text-blue-500" />
                  Browse Collections
                </Button>
              </Link>
              <Link href="/questions">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 px-4">
                  <FileQuestion className="h-5 w-5 text-emerald-500" />
                  Global Search
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin/upload">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 px-4 border-dashed border-primary/50 hover:border-primary">
                    <Upload className="h-5 w-5 text-violet-500" />
                    Batch Upload
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
