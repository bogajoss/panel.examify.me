import { FileQuestion, FolderOpen, Search } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: "file" | "folder" | "search";
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon = "folder",
  action,
}: EmptyStateProps) {
  const icons = {
    file: FileQuestion,
    folder: FolderOpen,
    search: Search,
  };

  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <Icon className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
