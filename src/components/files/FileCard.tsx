"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { QuestionFile } from "@/types";
import { deleteFile, updateFile } from "@/lib/actions";
import { useAuth } from "@/context/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Input,
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
} from "@/components/ui";
import {
  FileText,
  Edit2,
  Trash2,
  Eye,
  Upload,
  X,
  Check,
  MoreVertical,
  Clock,
  ChevronRight,
  Database,
} from "lucide-react";

interface FileCardProps {
  file: QuestionFile;
  onDelete?: () => void;
}

export function FileCard({ file, onDelete }: FileCardProps) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(file.displayName || file.originalFilename);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await deleteFile(file.$id);

    if (result.success) {
      setShowDeleteDialog(false);
      onDelete?.();
      router.refresh();
    } else {
      setError(result.error || "Failed to delete file");
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;

    const result = await updateFile(file.$id, { displayName: editName });

    if (result.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      setError(result.error || "Failed to update file");
    }
  };

  return (
    <>
      <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm border border-border/50">
        <CardHeader className="p-0">
          <div className="h-2 bg-primary/10 group-hover:bg-primary transition-colors" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <Database className="h-6 w-6" />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/files/${file.$id}`} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" /> View Questions
                  </Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/upload?merge=${file.$id}`} className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" /> Merge CSV
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive" 
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isEditing ? (
            <div className="space-y-3 mb-4">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-9"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} className="h-8 px-3">
                  <Check className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsEditing(false)}
                  className="h-8 px-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {file.displayName || file.originalFilename}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-widest">
                ID: {file.$id.slice(-8)}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center mb-6">
            <Badge variant="secondary" className="rounded-md font-medium px-2 py-0.5">
              {file.totalQuestions} Questions
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(file.uploadedAt)}
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 bg-muted/30 border-t">
          <Link href={`/files/${file.$id}`} className="w-full">
            <Button variant="ghost" className="w-full justify-between group/btn text-muted-foreground hover:text-primary p-0 h-auto">
              <span>View Collection</span>
              <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{file.displayName || file.originalFilename}&quot;</span>? This action cannot be undone and will delete all associated questions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
