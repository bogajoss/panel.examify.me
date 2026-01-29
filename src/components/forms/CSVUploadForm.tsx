"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { fileUploadSchema, type FileUploadFormData } from "@/types";
import { uploadCSVFile } from "@/lib/actions";
import {
  Button,
  Input,
  Label,
  Alert,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  Switch,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Database,
  HelpCircle,
} from "lucide-react";

export function CSVUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FileUploadFormData>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      displayName: "",
      convertZeroIndexed: false,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please select a valid CSV file.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);

      // Auto-fill display name from filename if empty
      if (!form.getValues("displayName")) {
        const nameWithoutExt = file.name.replace(/\.csv$/i, "");
        form.setValue("displayName", nameWithoutExt);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: FileUploadFormData) => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("displayName", data.displayName);
      formData.append("convertZeroIndexed", String(data.convertZeroIndexed));

      const result = await uploadCSVFile(formData);

      if (result.success && result.data) {
        setSuccess(
          `Successfully uploaded ${result.data.questionCount} questions!`,
        );
        clearFile();
        const fileId = result.data.fileId;
        setTimeout(() => {
          router.push(`/files/${fileId}`);
        }, 1500);
      } else {
        setError(
          result.error || "Failed to upload file. Check your CSV format.",
        );
      }
    } catch (err) {
      setError("An unexpected error occurred during upload.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* File Drop Zone */}
          <div className="space-y-3">
            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
              CSV Source File
            </Label>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 group cursor-pointer ${
                selectedFile
                  ? "bg-primary/5 border-primary shadow-inner"
                  : "bg-muted/30 border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                  <div className="h-16 w-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      {(selectedFile.size / 1024).toFixed(2)} KB · Ready to
                      Process
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Remove file
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 bg-background border-2 border-muted rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all duration-300">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Select CSV Collection</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                      Click to browse or drag and drop your question file here.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase tracking-tighter"
                  >
                    Only .CSV Files Supported
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card p-8 rounded-2xl border shadow-sm">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Database className="h-3.5 w-3.5" />
                      Collection Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Physics Final Exam 2024"
                        className="h-11 bg-muted/30 border-none focus-visible:ring-1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      This is how the collection will appear in the dashboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="convertZeroIndexed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-muted/10">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-bold flex items-center gap-2">
                        Zero-Indexed Conversion
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </FormLabel>
                      <FormDescription className="text-[10px]">
                        Convert 0-3 answers to 1-4 standard.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-bold text-foreground">
                      Validation active:
                    </span>{" "}
                    Our engine will verify your CSV structure before final
                    processing to ensure data integrity.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-auto">
                {error && (
                  <div className="mb-4 flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-xs font-medium border border-destructive/20 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-medium border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 font-bold shadow-lg shadow-primary/20 group"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4 animate-bounce" />
                      Uploading & Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                      Initialize Collection
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
