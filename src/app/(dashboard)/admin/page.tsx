import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getFiles, getQuestions } from "@/lib/actions";
import { Breadcrumb } from "@/components/layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Badge,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  Upload,
  Files,
  FileQuestion,
  Users,
  Settings,
  Shield,
  ChevronRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard | AntiGravity Question Bank",
};

export default async function AdminPage() {
  const { user } = await requireAdmin();

  // Fetch stats
  const filesResult = await getFiles({ pageSize: 1 });
  const questionsResult = await getQuestions({ pageSize: 1 });

  const totalFiles = filesResult.success ? filesResult.data?.total || 0 : 0;
  const totalQuestions = questionsResult.success
    ? questionsResult.data?.total || 0
    : 0;

  return (
    <div className="space-y-10 pb-20">
      <Breadcrumb items={[{ label: "Admin Control" }]} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Internal Access Only
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive system management and data oversight.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Files className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Files
                </p>
                <p className="text-3xl font-bold">{totalFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <FileQuestion className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Questions
                </p>
                <p className="text-3xl font-bold">{totalQuestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 rounded-xl">
                <Users className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Admin
                </p>
                <p className="text-lg font-bold truncate max-w-[150px]">
                  {user.name.split(" ")[0]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Management Modules
              <Separator className="flex-1" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/admin/upload">
                <Card className="group hover:ring-2 hover:ring-primary/20 transition-all duration-300 h-full border-none shadow-sm cursor-pointer overflow-hidden">
                  <div className="h-1 bg-blue-500" />
                  <CardContent className="p-6 space-y-4">
                    <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Batch Upload</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ingest questions via CSV
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/files">
                <Card className="group hover:ring-2 hover:ring-primary/20 transition-all duration-300 h-full border-none shadow-sm cursor-pointer overflow-hidden">
                  <div className="h-1 bg-emerald-500" />
                  <CardContent className="p-6 space-y-4">
                    <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Files className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Collections</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Audit and update files
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/questions">
                <Card className="group hover:ring-2 hover:ring-primary/20 transition-all duration-300 h-full border-none shadow-sm cursor-pointer overflow-hidden">
                  <div className="h-1 bg-violet-500" />
                  <CardContent className="p-6 space-y-4">
                    <div className="h-10 w-10 bg-violet-500/10 rounded-lg flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                      <FileQuestion className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Global Search</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cross-file question edit
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* CSV Format Guide */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-muted/30 pb-6">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Standard Data Schema
              </CardTitle>
              <CardDescription>
                Protocol for CSV question ingestion.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px] pl-6">Field</TableHead>
                    <TableHead>Definition</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      field: "questions",
                      def: "Core question text body. HTML tags are fully supported.",
                      req: "Required",
                    },
                    {
                      field: "option1-5",
                      def: "Choice payloads. Support plain text and HTML enrichment.",
                      req: "Optional",
                    },
                    {
                      field: "answer",
                      def: "Identifier for correct choice. Standard: 1-5 or A-E mapping.",
                      req: "Optional",
                    },
                    {
                      field: "explanation",
                      def: "Detailed rationale for the correct answer.",
                      req: "Optional",
                    },
                    {
                      field: "section",
                      def: "Mapping code (e.g., p=Physics, c=Chemistry).",
                      req: "Optional",
                    },
                  ].map((row) => (
                    <TableRow key={row.field}>
                      <TableCell className="font-mono text-xs font-bold text-primary pl-6">
                        {row.field}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.def}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge
                          variant={
                            row.req === "Required" ? "default" : "secondary"
                          }
                          className="text-[10px] uppercase"
                        >
                          {row.req}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <Shield className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Compliance & Security</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                System-wide integrity checks are enabled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p>Data is AES-256 encrypted at rest via Appwrite.</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p>CSV parsing includes automatic sanitization protocols.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-muted/20">
            <CardHeader>
              <CardTitle className="text-base">Support</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>For system issues, contact the technical lead.</p>
              <p className="font-mono text-xs mt-4 uppercase tracking-tighter">
                Instance: ANTI-G-29JAN26
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
