import { ChevronRight, Home, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showBack?: boolean;
  backHref?: string;
}

export function Breadcrumb({
  items,
  showBack = false,
  backHref,
}: BreadcrumbProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {showBack && (
        <Link href={backHref || "/"} className="inline-flex items-center group">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 pl-1 pr-3 text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
        </Link>
      )}

      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="w-3.5 h-3.5 mr-2" />
              Dashboard
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="inline-flex items-center">
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 mx-1" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-xs font-bold uppercase tracking-widest text-foreground">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
