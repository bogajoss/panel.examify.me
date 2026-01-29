"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Question } from "@/types";
import { deleteQuestion } from "@/lib/actions";
import { getImageUrl } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { answerToLetter, SECTION_LABELS, type SectionTypeValue } from "@/types";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Badge,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Separator
} from "@/components/ui";
import { 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon,
  MoreVertical,
  CheckCircle2,
  Info,
  ExternalLink
} from "lucide-react";

interface QuestionCardProps {
  question: Question;
  index: number;
  onDelete?: () => void;
}

export function QuestionCard({ question, index, onDelete }: QuestionCardProps) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await deleteQuestion(question.$id);

    if (result.success) {
      setShowDeleteDialog(false);
      onDelete?.();
      router.refresh();
    } else {
      setError(result.error || "Failed to delete question");
      setIsDeleting(false);
    }
  };

  const options = [
    { label: "A", value: question.option1 },
    { label: "B", value: question.option2 },
    { label: "C", value: question.option3 },
    { label: "D", value: question.option4 },
    { label: "E", value: question.option5 },
  ].filter((opt) => opt.value);

  const answerLetter = answerToLetter(question.answer);
  const sectionLabel = SECTION_LABELS[question.section as SectionTypeValue] || question.section;

  return (
    <>
      <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm border border-border/50">
        <div className="flex flex-col md:flex-row">
          {/* Question Number/Meta Sidebar (Desktop) */}
          <div className="w-full md:w-16 bg-muted/30 border-b md:border-b-0 md:border-r flex flex-row md:flex-col items-center justify-between md:justify-start p-3 md:pt-6 gap-4">
            <span className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
              {index + 1}
            </span>
            <div className="flex flex-row md:flex-col gap-2">
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm h-6 px-2">
                T{question.type}
              </Badge>
              {question.section !== "0" && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none h-6 px-2 uppercase text-[10px]">
                  {sectionLabel.charAt(0)}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                {/* Section & Type info for mobile/smaller screens */}
                <div className="flex flex-wrap gap-2 mb-4 md:hidden">
                  <Badge variant="outline">Question {index + 1}</Badge>
                  <Badge variant="secondary">Type {question.type}</Badge>
                  {question.section !== "0" && <Badge variant="default">{sectionLabel}</Badge>}
                </div>

                {/* Question Image */}
                {question.questionImageId && (
                  <div className="mb-6 group/img relative inline-block">
                    <img
                      src={getImageUrl(question.questionImageId)}
                      alt="Question"
                      className="max-h-64 rounded-xl border shadow-sm group-hover/img:shadow-md transition-shadow cursor-zoom-in"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                      <ExternalLink className="h-6 w-6 text-white drop-shadow-md" />
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <div
                  className="text-lg md:text-xl font-medium text-foreground leading-relaxed prose prose-neutral dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: question.questionText }}
                />
              </div>

              <div className="ml-4 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Question Tools</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={`/questions/${question.$id}/edit`} className="cursor-pointer">
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Question
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive" 
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Question
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {options.map((opt) => {
                const isCorrect = opt.label === answerLetter;
                return (
                  <div
                    key={opt.label}
                    className={`relative p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                      isCorrect
                        ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20"
                        : "bg-muted/20 border-border/50 hover:bg-muted/40"
                    }`}
                  >
                    <div className={`h-6 w-6 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isCorrect ? "bg-emerald-500 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                    }`}>
                      {opt.label}
                    </div>
                    <div 
                      className={`text-sm md:text-base ${isCorrect ? "text-emerald-900 dark:text-emerald-100 font-medium" : "text-muted-foreground"}`}
                      dangerouslySetInnerHTML={{ __html: opt.value }} 
                    />
                    {isCorrect && (
                      <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Answer & Explanation Footer */}
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg text-sm font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  Correct Answer: {answerLetter || question.answer || "N/A"}
                </div>
                {question.explanation && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs font-semibold text-muted-foreground hover:text-primary h-8"
                  >
                    <Info className="h-3.5 w-3.5 mr-1.5" />
                    {isExpanded ? "Hide Explanation" : "View Explanation"}
                  </Button>
                )}
              </div>

              {isExpanded && question.explanation && (
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Solution & Explanation
                  </h4>

                  {question.explanationImageId && (
                    <div className="mb-4">
                      <img
                        src={getImageUrl(question.explanationImageId)}
                        alt="Explanation"
                        className="max-h-64 rounded-xl border shadow-sm"
                      />
                    </div>
                  )}

                  <div
                    className="text-base text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: question.explanation }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 p-4 rounded-lg border text-sm italic line-clamp-3 my-2">
            <div dangerouslySetInnerHTML={{ __html: question.questionText }} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
