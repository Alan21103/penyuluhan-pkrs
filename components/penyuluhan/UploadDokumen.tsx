"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Upload, X, FileText, ImageIcon, File, Loader2, ExternalLink, Check,
} from "lucide-react";
import type { JenisDokumen } from "@/types/penyuluhan";

interface UploadedFile {
  jenis: JenisDokumen;
  file_name: string;
  file_path: string;
  file_size?: number;
  signed_url?: string;
}

interface UploadDokumenProps {
  penyuluhanId: string;
  userId: string;
  dokumenChecklist: JenisDokumen[];
  existingFiles?: UploadedFile[];
  onUploadComplete?: (files: UploadedFile[]) => void;
}

const JENIS_ICON: Record<JenisDokumen, React.ElementType> = {
  "Daftar Hadir": FileText,
  "Foto Kegiatan": ImageIcon,
  "Materi Edukasi": FileText,
  "Hasil Evaluasi": FileText,
  "Dokumentasi Lainnya": File,
};

const MAX_SIZE_MB = 10;

export default function UploadDokumen({
  penyuluhanId,
  userId,
  dokumenChecklist,
  existingFiles = [],
  onUploadComplete,
}: UploadDokumenProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingJenis, setUploadingJenis] = useState<JenisDokumen | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingFiles);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeJenis, setActiveJenis] = useState<JenisDokumen | null>(null);

  const getSignedUrl = useCallback(async (path: string): Promise<string> => {
    const { data } = await supabase.storage
      .from("penyuluhan-files")
      .createSignedUrl(path, 3600);
    return data?.signedUrl ?? "";
  }, [supabase]);

  useEffect(() => {
    const loadSignedUrls = async () => {
      const updated = await Promise.all(
        uploadedFiles.map(async (f) => {
          if (f.signed_url) return f;
          const url = await getSignedUrl(f.file_path);
          return { ...f, signed_url: url };
        })
      );
      setUploadedFiles(updated);
    };
    loadSignedUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUploadedForJenis = (jenis: JenisDokumen) =>
    uploadedFiles.filter((f) => f.jenis === jenis);

  const handleFileSelect = async (jenis: JenisDokumen, file: File) => {
    setErrors((e) => ({ ...e, [jenis]: "" }));

    // Validasi ukuran
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrors((e) => ({ ...e, [jenis]: `File terlalu besar. Maks ${MAX_SIZE_MB} MB.` }));
      return;
    }

    setUploadingJenis(jenis);

    const ext = file.name.split(".").pop();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${penyuluhanId}/${jenis.replace(/\s+/g, "_")}/${Date.now()}_${safeName}`;

    const { data, error } = await supabase.storage
      .from("penyuluhan-files")
      .upload(path, file, { upsert: false });

    if (error) {
      setErrors((e) => ({ ...e, [jenis]: `Upload gagal: ${error.message}` }));
      setUploadingJenis(null);
      return;
    }

    const signedUrl = await getSignedUrl(data.path);

    await supabase.from("dokumen_upload").insert({
      penyuluhan_id: penyuluhanId,
      jenis,
      file_url: data.path,
      file_name: file.name,
      file_size: file.size,
    });

    const newFile: UploadedFile = {
      jenis,
      file_name: file.name,
      file_path: data.path,
      file_size: file.size,
      signed_url: signedUrl,
    };

    const updated = [...uploadedFiles, newFile];
    setUploadedFiles(updated);
    onUploadComplete?.(updated);
    setUploadingJenis(null);
    setActiveJenis(null);
  };

  const handleRemove = async (file: UploadedFile) => {
    await supabase.storage.from("penyuluhan-files").remove([file.file_path]);
    await supabase
      .from("dokumen_upload")
      .delete()
      .eq("file_url", file.file_path);

    const updated = uploadedFiles.filter((f) => f.file_path !== file.file_path);
    setUploadedFiles(updated);
    onUploadComplete?.(updated);
  };

  const fmtSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (dokumenChecklist.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Pilih jenis dokumentasi di atas terlebih dahulu.
      </p>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <p className="text-xs text-muted-foreground mb-2">
        Upload file untuk setiap jenis dokumentasi yang dipilih (maks. {MAX_SIZE_MB} MB per file).
      </p>

      {dokumenChecklist.map((jenis) => {
        const Icon = JENIS_ICON[jenis] ?? File;
        const files = getUploadedForJenis(jenis);
        const isUploading = uploadingJenis === jenis;
        const err = errors[jenis];

        return (
          <div key={jenis} className="bg-muted/30 rounded-xl border border-border p-4">
            {/* Header jenis */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{jenis}</span>
                {files.length > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    <Check className="w-2.5 h-2.5" /> {files.length} file
                  </span>
                )}
              </div>
              <label
                htmlFor={`upload-${jenis}`}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-all",
                  isUploading
                    ? "opacity-50 pointer-events-none bg-muted border-border"
                    : "bg-background border-primary/30 text-primary hover:bg-primary/5 hover:border-primary"
                )}
              >
                {isUploading ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-3 h-3" /> Upload</>
                )}
              </label>
              <input
                id={`upload-${jenis}`}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(jenis, file);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Error */}
            {err && (
              <p className="text-xs text-destructive mb-2">{err}</p>
            )}

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f) => (
                  <div
                    key={f.file_path}
                    className="flex items-center gap-2 bg-card rounded-lg border border-border px-3 py-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground flex-1 truncate">{f.file_name}</span>
                    {f.file_size && (
                      <span className="text-[10px] text-muted-foreground">{fmtSize(f.file_size)}</span>
                    )}
                    {f.signed_url && (
                      <a
                        href={f.signed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:text-primary transition-colors text-muted-foreground"
                        title="Buka file"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(f)}
                      className="p-1 rounded hover:text-destructive transition-colors text-muted-foreground"
                      title="Hapus file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length === 0 && !isUploading && (
              <p className="text-xs text-muted-foreground/60 italic">Belum ada file diupload</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
