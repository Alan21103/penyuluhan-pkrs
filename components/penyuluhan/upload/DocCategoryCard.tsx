import React from "react";
import { Upload, Loader2, Check, AlertCircle, Link as LinkIcon, File } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JenisDokumen } from "@/types/penyuluhan";
import type { UploadedDocItem } from "./types";
import { JENIS_ICON } from "./types";
import DocPhotoGrid from "./DocPhotoGrid";
import DocFileList from "./DocFileList";
import DocCloudLinkForm from "./DocCloudLinkForm";

interface DocCategoryCardProps {
  jenis: JenisDokumen;
  files: UploadedDocItem[];
  isUploading: boolean;
  compressingStatus: string | null;
  error?: string;
  mode: "create" | "edit";
  showCloudForm: boolean;
  onToggleCloudForm: () => void;
  onFileSelect: (files: FileList | null) => void;
  onAddCloudLink: (title: string, url: string) => Promise<void>;
  onPreviewPhoto: (file: UploadedDocItem) => void;
  onRemoveDoc: (file: UploadedDocItem) => void;
}

export default function DocCategoryCard({
  jenis,
  files,
  isUploading,
  compressingStatus,
  error,
  mode,
  showCloudForm,
  onToggleCloudForm,
  onFileSelect,
  onAddCloudLink,
  onPreviewPhoto,
  onRemoveDoc,
}: DocCategoryCardProps) {
  const Icon = JENIS_ICON[jenis] ?? File;
  const isPhotoCategory = jenis === "Foto Kegiatan";

  return (
    <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden transition-all">
      {/* ── Card Header ── */}
      <div className="p-4 bg-muted/30 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              {jenis}
              {files.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> {files.length} item {mode === "create" ? "(Siap diunggah)" : ""}
                </span>
              )}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {isPhotoCategory
                ? "Unggah foto resolusi kamera (otomatis dioptimalkan WebP)"
                : "Unggah berkas PDF/Word/Excel (maks. 3 MB) atau tautan Cloud"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Tautan Cloud Button */}
          <button
            type="button"
            onClick={onToggleCloudForm}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Lampirkan link Google Drive / Cloud"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>+ Link Cloud</span>
          </button>

          {/* Upload File Button */}
          <label
            htmlFor={`upload-${jenis}`}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border cursor-pointer transition-all shadow-2xs",
              isUploading
                ? "opacity-50 pointer-events-none bg-muted border-border"
                : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>{isPhotoCategory ? "Unggah Foto" : "Unggah Berkas"}</span>
              </>
            )}
          </label>
          <input
            id={`upload-${jenis}`}
            type="file"
            multiple={isPhotoCategory}
            className="hidden"
            accept={
              isPhotoCategory
                ? "image/jpeg,image/png,image/webp,image/jpg"
                : "application/pdf,.doc,.docx,.xls,.xlsx,image/*"
            }
            onChange={(e) => {
              onFileSelect(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* ── Input Cloud Link Modal / Collapse ── */}
      {showCloudForm && (
        <DocCloudLinkForm
          jenis={jenis}
          onClose={onToggleCloudForm}
          onSubmit={async (title, url) => {
            await onAddCloudLink(title, url);
          }}
        />
      )}

      {/* ── Compressing / Uploading Live Progress Indicator ── */}
      {isUploading && compressingStatus && (
        <div className="p-3 bg-primary/5 border-b border-primary/20 flex items-center gap-2 text-xs text-primary font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{compressingStatus}</span>
        </div>
      )}

      {/* ── Error Message ── */}
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Items Content ── */}
      <div className="p-4">
        {files.length === 0 && !isUploading && (
          <div className="text-center py-6 text-xs text-muted-foreground/70 italic border border-dashed border-border/60 rounded-xl bg-muted/10">
            Belum ada {isPhotoCategory ? "foto" : "dokumen"} dipilih untuk kategori ini.
          </div>
        )}

        {isPhotoCategory && files.length > 0 && (
          <DocPhotoGrid
            files={files}
            onPreview={onPreviewPhoto}
            onRemove={onRemoveDoc}
          />
        )}

        {!isPhotoCategory && files.length > 0 && (
          <DocFileList
            files={files}
            onRemove={onRemoveDoc}
          />
        )}
      </div>
    </div>
  );
}
