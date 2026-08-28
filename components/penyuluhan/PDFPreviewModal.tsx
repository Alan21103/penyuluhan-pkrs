"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import jsPDF from "jspdf";
import { X, Download, Loader2, FileText, ExternalLink, Eye } from "lucide-react";
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

  const handleOpenInNewTab = useCallback(() => {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank");
  }, [pdfUrl]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-4xl h-[90vh] max-h-[800px] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border bg-card shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                Preview PDF Formulir PKRS
              </h3>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                {fileName}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Open in new tab button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="gap-1.5 rounded-xl text-xs h-8 sm:h-9 px-2.5 sm:px-3 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
              title="Buka PDF di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buka di Tab</span>
            </Button>

            {/* Download button */}
            <Button
              id="btn-download-pdf"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 sm:h-9 px-2.5 sm:px-3"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download</span>
            </Button>

            {/* Close button */}
            <button
              id="btn-close-preview"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Tutup preview"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* PDF Content Area */}
        <div className="flex-1 overflow-hidden bg-slate-100 dark:bg-slate-950 relative flex flex-col">
          {pdfUrl ? (
            <>
              {/* Desktop view: Native embedded PDF object with iframe fallback */}
              <div className="hidden md:block w-full h-full">
                <object
                  data={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0"
                    title="Preview PDF"
                  />
                </object>
              </div>

              {/* Mobile / Tablet View (< md): Clean Card Preview with Quick Open */}
              <div className="md:hidden flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-center mb-4 shadow-sm">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Dokumen PDF Siap
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs mb-6">
                  {fileName}
                </p>

                <div className="w-full max-w-xs space-y-2.5">
                  <Button
                    onClick={handleOpenInNewTab}
                    className="w-full gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs h-11"
                  >
                    <Eye className="w-4 h-4" />
                    Buka & Lihat PDF
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full gap-2 rounded-xl border-border h-11 text-foreground"
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Unduh File PDF
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground mt-4">
                  Ketuk tombol di atas untuk membuka PDF langsung di browser HP.
                </p>
              </div>
            </>
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
