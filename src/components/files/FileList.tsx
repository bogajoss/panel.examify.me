"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { QuestionFile, FileFilters } from "@/types";
import { getFiles } from "@/lib/actions";
import { FileCard } from "./FileCard";
import {
  EmptyState,
  LoadingSpinner,
  Pagination,
  Input,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  Search,
  SortAsc,
  SortDesc,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

interface FileListProps {
  initialFiles?: QuestionFile[];
  initialTotal?: number;
}

export function FileList({ initialFiles, initialTotal }: FileListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [files, setFiles] = useState<QuestionFile[]>(initialFiles || []);
  const [total, setTotal] = useState(initialTotal || 0);
  const [isLoading, setIsLoading] = useState(!initialFiles);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  const page = parseInt(searchParams.get("page") || "1");
  const sortBy =
    (searchParams.get("sortBy") as FileFilters["sortBy"]) || "uploaded";
  const sortOrder =
    (searchParams.get("sortOrder") as FileFilters["sortOrder"]) || "desc";
  const pageSize = 12; // Use a grid-friendly number

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      const result = await getFiles({
        search: searchParams.get("search") || undefined,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });

      if (result.success && result.data) {
        setFiles(result.data.documents);
        setTotal(result.data.total);
      }
      setIsLoading(false);
    };

    fetchFiles();
  }, [searchParams, page, sortBy, sortOrder]);

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/files?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ search: searchTerm || undefined, page: "1" });
  };

  const handleSort = (field: "name" | "uploaded" | "questions") => {
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    updateSearchParams({ sortBy: field, sortOrder: newOrder });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: String(newPage) });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-8">
      {/* Search and Sort Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card p-6 rounded-2xl border shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-none focus-visible:ring-1"
          />
        </form>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
            <SlidersHorizontal className="h-4 w-4" />
            Sort by:
          </div>
          <Tabs
            value={sortBy}
            onValueChange={(v) => handleSort(v as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-muted/50 p-1 h-11">
              <TabsTrigger value="uploaded" className="px-4 h-9">
                Date
                {sortBy === "uploaded" &&
                  (sortOrder === "desc" ? (
                    <SortDesc className="h-3 w-3 ml-2" />
                  ) : (
                    <SortAsc className="h-3 w-3 ml-2" />
                  ))}
              </TabsTrigger>
              <TabsTrigger value="name" className="px-4 h-9">
                Name
                {sortBy === "name" &&
                  (sortOrder === "desc" ? (
                    <SortDesc className="h-3 w-3 ml-2" />
                  ) : (
                    <SortAsc className="h-3 w-3 ml-2" />
                  ))}
              </TabsTrigger>
              <TabsTrigger value="questions" className="px-4 h-9">
                Questions
                {sortBy === "questions" &&
                  (sortOrder === "desc" ? (
                    <SortDesc className="h-3 w-3 ml-2" />
                  ) : (
                    <SortAsc className="h-3 w-3 ml-2" />
                  ))}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {total} collection{total !== 1 ? "s" : ""} available
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-muted animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="py-20">
            <EmptyState
              icon="folder"
              title="No collections found"
              description={
                searchParams.get("search")
                  ? "We couldn't find any files matching your search."
                  : "You haven't uploaded any question banks yet."
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {files.map((file) => (
              <FileCard key={file.$id} file={file} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center py-10">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
