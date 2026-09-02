import React from "react";
import { Info } from "lucide-react";

export default function UploadGuidelines() {
  return (
    <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl text-xs text-blue-950 dark:text-blue-200">
      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold text-blue-900 dark:text-blue-100">
          Ketentuan Upload Dokumen:
        </p>
        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-800/90 dark:text-blue-300/90">
          <li>
            <span className="font-medium">Foto Kegiatan:</span> Format JPG, PNG, atau WebP (bisa pilih banyak foto sekaligus).
          </li>
          <li>
            <span className="font-medium">Berkas Dokumen:</span> Format PDF, Word (.doc/.docx), atau Excel (maksimal 3 MB per berkas).
          </li>
          <li>
            <span className="font-medium">Materi & Berkas Besar:</span> Gunakan tombol{" "}
            <span className="font-medium underline">+ Link Cloud</span> untuk menyematkan tautan Google Drive / Canva / YouTube.
          </li>
        </ul>
      </div>
    </div>
  );
}
