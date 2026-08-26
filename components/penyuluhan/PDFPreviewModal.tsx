"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import jsPDF from "jspdf";
import { X, Download, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDoc: jsPDF | null;
  fileName: string;
}

export default function PDFPreviewModal({
  isOpen,
  onClose,
  pdfDoc,
  fileName,
}: PDFPreviewModalProps) {
  const [downloading, setDownloading] = useState(false);

  const pdfUrl = useMemo(() => {
    if (!isOpen || !pdfDoc) return null;
    const blob = pdfDoc.output("blob");
    return URL.createObjectURL(blob);
  }, [isOpen, pdfDoc]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleDownload = useCallback(() => {
    if (!pdfDoc) return;
    setDownloading(true);
    setTimeout(() => {
      pdfDoc.save(fileName);
      setDownloading(false);
    }, 300);
  }, [pdfDoc, fileName]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !pdfDoc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border shadow-2xl rounded-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">
                Preview PDF
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                {fileName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              id="btn-download-pdf"
              onClick={handleDownload}
              disabled={downloading}
              className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloading ? "Mengunduh..." : "Download"}
            </Button>
            <button
              id="btn-close-preview"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Tutup preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Preview PDF"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
