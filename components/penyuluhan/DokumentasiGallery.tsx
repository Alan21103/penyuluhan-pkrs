"use client";

import { useState } from "react";
import {
  ImageIcon,
  FileText,
  ExternalLink,
  Eye,
  Download,
  Link as LinkIcon,
  FileSpreadsheet,
} from "lucide-react";
import { formatFileSize } from "@/lib/image-compression";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface DokumentasiItem {
  id: string;
  penyuluhan_id: string;
  jenis: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  file_type?: string;
  is_external_link?: boolean;
  signed_url?: string;
  uploaded_at?: string;
}

interface DokumentasiGalleryProps {
  dokumen: DokumentasiItem[];
  dokumenChecklist?: string[];
}

export default function DokumentasiGallery({
  dokumen = [],
  dokumenChecklist = [],
}: DokumentasiGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<DokumentasiItem | null>(null);

  const photos = dokumen.filter(
    (d) =>
      d.jenis === "Foto Kegiatan" ||
      d.file_type === "image" ||
      d.file_name?.match(/\.(webp|jpe?g|png|gif|avif)$/i)
  );

  const otherDocs = dokumen.filter(
    (d) =>
      !d.is_external_link &&
      d.jenis !== "Foto Kegiatan" &&
      d.file_type !== "image" &&
      !d.file_name?.match(/\.(webp|jpe?g|png|gif|avif)$/i)
  );

  const externalLinks = dokumen.filter((d) => d.is_external_link || d.file_type === "link");

  const getDocIcon = (filename: string) => {
    if (filename.match(/\.(xlsx?|csv)$/i)) return FileSpreadsheet;
    return FileText;
  };

  return (
    <div className="space-y-6">
      {/* Checklist Dokumentasi Status */}
      {dokumenChecklist.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-border/60">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            Checklist Tersedia:
          </span>
          {dokumenChecklist.map((c) => (
            <span
              key={c}
              className="inline-flex items-center text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20"
            >
              ✓ {c}
            </span>
          ))}
        </div>
      )}

      {dokumen.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/20">
          <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Belum Ada Dokumentasi</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Belum ada foto atau dokumen yang diunggah untuk kegiatan penyuluhan ini.
          </p>
        </div>
      ) : null}

      {/* 1. Galeri Foto Kegiatan */}
      {photos.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Foto Kegiatan ({photos.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((item) => (
              <div
                key={item.id || item.file_url}
                className="group relative aspect-4/3 rounded-xl overflow-hidden border border-border bg-muted/30 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedPhoto(item)}
              >
                {item.signed_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.signed_url}
                    alt={item.file_name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/40">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 bg-white/90 text-zinc-900 rounded-full shadow-md transform translate-y-1 group-hover:translate-y-0 transition-all">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>

                {/* Size Badge */}
                {item.file_size ? (
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/65 backdrop-blur-xs rounded text-[9px] text-white font-mono">
                    {formatFileSize(item.file_size)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Berkas Dokumen Terlampir */}
      {otherDocs.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Dokumen & Berkas ({otherDocs.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {otherDocs.map((item) => {
              const DocIcon = getDocIcon(item.file_name);
              return (
                <div
                  key={item.id || item.file_url}
                  className="flex items-center justify-between gap-3 p-3 bg-card hover:bg-muted/30 rounded-xl border border-border shadow-2xs transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <DocIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.file_name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className="font-medium text-primary/80">{item.jenis}</span>
                        {item.file_size ? <span>• {formatFileSize(item.file_size)}</span> : null}
                      </div>
                    </div>
                  </div>

                  {item.signed_url && (
                    <a
                      href={item.signed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary text-muted-foreground transition-colors shrink-0"
                      title="Buka / Unduh Dokumen"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Tautan Eksternal / Google Drive */}
      {externalLinks.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-sky-500" />
            Tautan Materi & Cloud ({externalLinks.length})
          </h4>
          <div className="space-y-2">
            {externalLinks.map((item) => (
              <div
                key={item.id || item.file_url}
                className="flex items-center justify-between gap-3 p-3 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/40 rounded-xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.file_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-md">
                      {item.file_url}
                    </p>
                  </div>
                </div>
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shrink-0"
                >
                  <span>Buka Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-zinc-950/95 border-zinc-800 text-white">
            <DialogHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-sm font-medium text-zinc-200 truncate pr-6">
                  {selectedPhoto.file_name}
                </DialogTitle>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Kategori: {selectedPhoto.jenis}
                  {selectedPhoto.file_size ? ` • ${formatFileSize(selectedPhoto.file_size)}` : ""}
                </p>
              </div>
            </DialogHeader>
            <div className="p-2 flex items-center justify-center max-h-[75vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.signed_url || selectedPhoto.file_url}
                alt={selectedPhoto.file_name}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
            <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex justify-end gap-2">
              <a
                href={selectedPhoto.signed_url || selectedPhoto.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download={selectedPhoto.file_name}
                className="text-xs px-3.5 py-1.5 bg-primary text-primary-foreground font-medium rounded-lg flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Ukuran Asli
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
