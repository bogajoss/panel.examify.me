"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { questionSchema, type QuestionFormData, SECTION_LABELS, type SectionTypeValue } from "@/types";
import { createQuestion, updateQuestion, uploadQuestionImage, deleteQuestionImage } from "@/lib/actions";
import { getImageUrl } from "@/lib/utils";
import { 
  Button, 
  Input, 
  Textarea, 
  Label, 
  Alert, 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent, 
  CardFooter,
  Separator
} from "@/components/ui";
import { Save, Image as ImageIcon, X, Trash2, CheckCircle2, AlertCircle, HelpCircle, FileText, LayoutGrid } from "lucide-react";

interface QuestionFormProps {
  fileId: string;
  question?: {
    $id: string;
    questionText: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    option5: string;
    answer: string;
    explanation: string;
    type: number;
    section: string;
    questionImageId?: string;
    explanationImageId?: string;
  };
  onSuccess?: () => void;
}

export function QuestionForm({ fileId, question, onSuccess }: QuestionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image states
  const [questionImageId, setQuestionImageId] = useState<string | undefined>(question?.questionImageId);
  const [explanationImageId, setExplanationImageId] = useState<string | undefined>(question?.explanationImageId);
  const [isUploadingQuestionImage, setIsUploadingQuestionImage] = useState(false);
  const [isUploadingExplanationImage, setIsUploadingExplanationImage] = useState(false);

  const questionImageRef = useRef<HTMLInputElement>(null);
  const explanationImageRef = useRef<HTMLInputElement>(null);

  const isEditing = !!question;

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: question
      ? {
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
        }
      : {
          questionText: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          option5: "",
          answer: "",
          explanation: "",
          type: 0,
          section: "0",
        },
  });

  const handleImageUpload = async (
    file: File,
    type: "question" | "explanation"
  ) => {
    const setUploading = type === "question" ? setIsUploadingQuestionImage : setIsUploadingExplanationImage;
    const setImageId = type === "question" ? setQuestionImageId : setExplanationImageId;
    const currentImageId = type === "question" ? questionImageId : explanationImageId;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadQuestionImage(formData);

      if (result.success && result.data) {
        // Delete old image if exists
        if (currentImageId) {
          try { await deleteQuestionImage(currentImageId); } catch(e) {}
        }
        setImageId(result.data.fileId);
      } else {
        setError(result.error || "Failed to upload image");
      }
    } catch (err) {
      setError("Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (type: "question" | "explanation") => {
    const imageId = type === "question" ? questionImageId : explanationImageId;
    const setImageId = type === "question" ? setQuestionImageId : setExplanationImageId;

    if (imageId) {
      try {
        await deleteQuestionImage(imageId);
        setImageId(undefined);
      } catch (err) {
        console.error("Failed to delete image:", err);
        setImageId(undefined); // Still remove it from UI
      }
    }
  };

  const onSubmit = async (data: QuestionFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const result = await updateQuestion(question.$id, {
          ...data,
          questionImageId,
          explanationImageId,
        });

        if (result.success) {
          onSuccess?.();
          router.refresh();
        } else {
          setError(result.error || "Failed to update question");
        }
      } else {
        const result = await createQuestion(fileId, {
          ...data,
          questionImageId,
          explanationImageId,
          orderIndex: 0,
        });

        if (result.success) {
          onSuccess?.();
          router.push(`/files/${fileId}`);
          router.refresh();
        } else {
          setError(result.error || "Failed to create question");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred during submission.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{isEditing ? "Edit Question" : "New Question"}</h1>
          <p className="text-muted-foreground mt-1">Compose and configure your question data.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {/* Main Content Card */}
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 pb-8 pt-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Question Content</CardTitle>
                  <CardDescription>The core text and visual context of your question.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold flex items-center gap-2">
                      Prompt / Text
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Type your question here... (HTML supported)" 
                        className="min-h-[120px] bg-muted/20 border-none focus-visible:ring-1 text-lg leading-relaxed" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel className="text-sm font-bold">Supporting Image</FormLabel>
                <div className="flex flex-wrap gap-4">
                  {questionImageId ? (
                    <div className="relative group rounded-2xl overflow-hidden border shadow-md animate-in zoom-in-95 duration-200">
                      <img
                        src={getImageUrl(questionImageId)}
                        alt="Question"
                        className="max-h-48 object-contain bg-muted"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 rounded-full"
                          onClick={() => handleRemoveImage("question")}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => questionImageRef.current?.click()}
                      className="h-32 w-full md:w-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                    >
                      {isUploadingQuestionImage ? (
                        <div className="animate-pulse flex flex-col items-center gap-2">
                          <ImageIcon className="h-8 w-8 animate-bounce" />
                          <span className="text-xs font-bold uppercase tracking-widest">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="h-8 w-8" />
                          <span className="text-xs font-bold uppercase tracking-widest">Add Question Image</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={questionImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "question");
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options Grid */}
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 pb-8 pt-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Options & Answer</CardTitle>
                  <CardDescription>Define the possible choices and mark the correct one.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[1, 2, 3, 4, 5].map((num) => (
                  <FormField
                    key={num}
                    control={form.control}
                    name={`option${num}` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Choice {num}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={`Enter option ${num}...`} 
                            className="h-11 bg-muted/20 border-none focus-visible:ring-1" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-emerald-600">Correct Answer</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. 1 or A" 
                          className="h-11 border-2 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/10" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-[10px]">Reference by number (1-5) or letter (A-E).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-8" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">Section / Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-muted/20 border-none focus-visible:ring-1">
                            <SelectValue placeholder="Select a section" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(SECTION_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">Question Type (ID)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          className="h-11 bg-muted/20 border-none focus-visible:ring-1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Solution Card */}
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 pb-8 pt-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Solution & Explanation</CardTitle>
                  <CardDescription>Provide insights on why the answer is correct.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold">Explanation Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain the logic behind the correct answer..." 
                        className="min-h-[120px] bg-muted/20 border-none focus-visible:ring-1 leading-relaxed" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel className="text-sm font-bold">Explanation Image</FormLabel>
                <div className="flex flex-wrap gap-4">
                  {explanationImageId ? (
                    <div className="relative group rounded-2xl overflow-hidden border shadow-md animate-in zoom-in-95 duration-200">
                      <img
                        src={getImageUrl(explanationImageId)}
                        alt="Explanation"
                        className="max-h-48 object-contain bg-muted"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 rounded-full"
                          onClick={() => handleRemoveImage("explanation")}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => explanationImageRef.current?.click()}
                      className="h-32 w-full md:w-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-violet-500 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-300"
                    >
                      {isUploadingExplanationImage ? (
                        <div className="animate-pulse flex flex-col items-center gap-2">
                          <ImageIcon className="h-8 w-8 animate-bounce" />
                          <span className="text-xs font-bold uppercase tracking-widest">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="h-8 w-8" />
                          <span className="text-xs font-bold uppercase tracking-widest">Add Solution Image</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={explanationImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "explanation");
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm font-medium border border-destructive/20 animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none h-12 px-8 font-bold"
              >
                Discard Changes
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none h-12 px-10 font-bold shadow-lg shadow-primary/20 group"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                    {isEditing ? "Save Modifications" : "Publish Question"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
