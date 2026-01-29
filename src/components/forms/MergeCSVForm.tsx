"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import type { QuestionFile } from "@/types";
import { mergeCSVFile } from "@/lib/actions";
import {
  Button,
  Input,
  Label,
  Alert,
  Switch,
  Badge,
  Separator,
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
  ArrowLeft,
  Database,
  PlusCircle,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface MergeCSVFormProps {
  file: QuestionFile;
}

export function MergeCSVForm({ file }: MergeCSVFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [convertZeroIndexed, setConvertZeroIndexed] = useState(false);

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
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a file to merge.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("convertZeroIndexed", String(convertZeroIndexed));

      const result = await mergeCSVFile(file.$id, formData);

      if (result.success && result.data) {
        setSuccess(
          `Successfully merged ${result.data.questionCount} new questions into the collection!`,
        );
        clearFile();
        setTimeout(() => {
          router.push(`/files/${file.$id}`);
        }, 1500);
      } else {
        setError(
          result.error || "Failed to merge questions. Check your CSV format.",
        );
      }
    } catch (err) {
      setError("An unexpected error occurred during the merge process.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
        <div className="h-10 w-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-sm">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary/70">
            Target Collection
          </p>
          <h3 className="font-bold text-lg">
            {file.displayName || file.originalFilename}
          </h3>
        </div>
        <Badge variant="secondary" className="ml-auto font-mono">
          {file.totalQuestions} Questions
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* File Drop Zone */}
        <div className="space-y-3">
          <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Append CSV Data
          </Label>
          <div
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 group cursor-pointer ${
              selectedFile
                ? "bg-emerald-500/5 border-emerald-500 shadow-inner"
                : "bg-muted/30 border-muted-foreground/20 hover:border-emerald-500/50 hover:bg-muted/50"
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
                <div className="h-16 w-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    {(selectedFile.size / 1024).toFixed(2)} KB · Ready to Merge
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
                <div className="mx-auto h-16 w-16 bg-background border-2 border-muted rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all duration-300">
                  <PlusCircle className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-bold">Add Question Data</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                    Select a CSV file to append its questions to the current
                    collection.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-8">
          <div className="flex flex-row items-center justify-between rounded-xl border p-4 bg-muted/10">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold flex items-center gap-2">
                Zero-Indexed Conversion
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Convert 0-3 answers to 1-4 standard for this import.
              </p>
            </div>
            <Switch
              checked={convertZeroIndexed}
              onCheckedChange={setConvertZeroIndexed}
            />
          </div>

          <div className="pt-2">
            {error && (
              <div className="mb-6 flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-xs font-medium border border-destructive/20 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-medium border border-emerald-500/20 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/files/${file.$id}`}
                className="flex-1 order-2 sm:order-1"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-12 font-bold"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-[2] h-12 font-bold shadow-lg shadow-emerald-500/20 order-1 sm:order-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4 animate-bounce" />
                    Merging Questions...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Merge Into Collection
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
