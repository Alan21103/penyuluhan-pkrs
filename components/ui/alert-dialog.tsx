"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface AlertDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange?.(false)}
        aria-hidden="true"
      />
      {/* Content wrapper */}
      <div className="relative z-50 w-full max-w-sm flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function AlertDialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className={cn(
        "relative w-full rounded-2xl bg-card border border-border shadow-2xl p-6 animate-in zoom-in-95 fade-in-0 duration-200 overflow-hidden",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDialogHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-2 text-left", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDialogTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-bold text-foreground leading-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function AlertDialogDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDialogFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-3 pt-4 mt-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDialogAction({
  className,
  variant = "destructive",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}) {
  return (
    <button
      className={cn(
        buttonVariants({ variant }),
        "flex-1 rounded-xl cursor-pointer font-medium",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AlertDialogCancel({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: "outline" }),
        "flex-1 rounded-xl cursor-pointer font-medium",
        className
      )}
      {...props}
    >
      {children || "Batal"}
    </button>
  );
}
