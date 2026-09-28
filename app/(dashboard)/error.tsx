"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[50vh]">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-bold text-foreground">Terjadi Kendala Memuat Halaman</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        Sistem tidak dapat memproses permintaan ini. Silakan coba muat ulang atau periksa koneksi internet Anda.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button
          onClick={() => reset()}
          className="gap-2 rounded-xl cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Coba Lagi
        </Button>
      </div>
    </div>
  );
}
