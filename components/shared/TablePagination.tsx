"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  itemName?: string;
  className?: string;
}

export default function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemName = "data",
  className,
}: TablePaginationProps) {
  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  // Generate visible page numbers (max 5 around current page)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/15 text-xs select-none",
        className
      )}
    >
      <p className="text-muted-foreground font-medium">
        Menampilkan <span className="font-semibold text-foreground">{startItem}–{endItem}</span> dari{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> {itemName}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center text-foreground"
          title="Halaman Sebelumnya"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-muted-foreground">
                  ...
                </span>
              );
            }
            const pageNum = p as number;
            const isActive = pageNum === page;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "min-w-8 h-8 px-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <span className="sm:hidden px-2 font-medium text-muted-foreground">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center text-foreground"
          title="Halaman Berikutnya"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
