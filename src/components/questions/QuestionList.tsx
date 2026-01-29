"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Question, QuestionFilters, SectionTypeValue } from "@/types";
import { SECTION_LABELS } from "@/types";
import { getQuestions } from "@/lib/actions";
import { QuestionCard } from "./QuestionCard";
import { 
  EmptyState, 
  LoadingSpinner, 
  Pagination, 
  Input, 
  Button, 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator
} from "@/components/ui";
import { Search, Filter, X, SlidersHorizontal, ChevronRight } from "lucide-react";

interface QuestionListProps {
  fileId?: string;
  initialQuestions?: Question[];
  initialTotal?: number;
}

export function QuestionList({
  fileId,
  initialQuestions,
  initialTotal,
}: QuestionListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [total, setTotal] = useState(initialTotal || 0);
  const [isLoading, setIsLoading] = useState(!initialQuestions);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const section = searchParams.get("section") || undefined;
  const type = searchParams.get("type") ? parseInt(searchParams.get("type")!) : undefined;
  const pageSize = 20;

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      const result = await getQuestions({
        fileId,
        search: searchParams.get("search") || undefined,
        section: section as SectionTypeValue,
        type,
        page,
        pageSize,
      });

      if (result.success && result.data) {
        setQuestions(result.data.documents);
        setTotal(result.data.total);
      }
      setIsLoading(false);
    };

    fetchQuestions();
  }, [searchParams, fileId, page, section, type]);

  const basePath = fileId ? `/files/${fileId}` : "/questions";

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${basePath}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ search: searchTerm || undefined, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: String(newPage) });
  };

  const handleSectionChange = (value: string) => {
    updateSearchParams({ section: value === "all" ? undefined : value, page: "1" });
  };

  const handleTypeChange = (value: string) => {
    updateSearchParams({ type: value === "all" ? undefined : value, page: "1" });
  };

  const clearFilters = () => {
    updateSearchParams({
      search: undefined,
      section: undefined,
      type: undefined,
      page: "1",
    });
    setSearchTerm("");
  };

  const totalPages = Math.ceil(total / pageSize);

  const hasActiveFilters = section || type || searchParams.get("search");

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden transition-all duration-300">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by question text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-none focus-visible:ring-1"
              />
            </form>

            <div className="flex gap-2">
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="h-11 px-6"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="default" className="ml-2 h-5 min-w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                    { [section, type, searchParams.get("search")].filter(Boolean).length }
                  </Badge>
                )}
              </Button>
              <Button type="submit" onClick={handleSearch} className="h-11 px-6">
                Search
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t animate-in slide-in-from-top-4 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Section</label>
                  <Select value={section || "all"} onValueChange={handleSectionChange}>
                    <SelectTrigger className="h-10 bg-muted/30 border-none ring-offset-background focus:ring-1">
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {Object.entries(SECTION_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Question Type</label>
                  <Select value={type?.toString() || "all"} onValueChange={handleTypeChange}>
                    <SelectTrigger className="h-10 bg-muted/30 border-none ring-offset-background focus:ring-1">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="0">Type 0 (Normal)</SelectItem>
                      <SelectItem value="1">Type 1</SelectItem>
                      <SelectItem value="2">Type 2</SelectItem>
                      <SelectItem value="3">Type 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4 mr-2" />
                      Clear all filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          {total} results found
          {hasActiveFilters && <Badge variant="secondary" className="font-normal lowercase">filtered</Badge>}
        </h2>
      </div>

      {/* Question List */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="py-20">
          <EmptyState
            icon="file"
            title="No questions found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters or search terms to find what you're looking for."
                : "This collection doesn't have any questions yet."
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.$id}
              question={question}
              index={(page - 1) * pageSize + index}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-8 pb-12">
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
