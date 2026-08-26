"use client";

import { useState } from "react";
import { generatePDF, getPDFFilename } from "@/lib/pdf-generator";
import { createClient } from "@/lib/supabase/client";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PDFPreviewModal from "@/components/penyuluhan/PDFPreviewModal";
import type jsPDF from "jspdf";

export default function DetailPenyuluhanView({ penyuluhanId }: { penyuluhanId: string }) {
  const [loading, setLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<jsPDF | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const supabase = createClient();

  const handleExportPDF = async () => {
    setLoading(true);
    const { data } = await supabase.from("penyuluhan").select("*").eq("id", penyuluhanId).single();
    if (data) {
      const doc = await generatePDF(data as any);
      setPreviewDoc(doc);
      setPreviewFileName(getPDFFilename(data as any));
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        variant="outline"
        id="btn-export-pdf-detail"
        onClick={handleExportPDF}
        disabled={loading}
        className="gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
        Export PDF
      </Button>

      <PDFPreviewModal
        isOpen={!!previewDoc}
        onClose={() => { setPreviewDoc(null); setPreviewFileName(""); }}
        pdfDoc={previewDoc}
        fileName={previewFileName}
      />
    </>
  );
}
