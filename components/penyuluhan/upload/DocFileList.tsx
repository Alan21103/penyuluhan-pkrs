import React from "react";
import { FileText, Link as LinkIcon, ExternalLink, Trash2 } from "lucide-react";
import { formatFileSize } from "@/lib/image-compression";
import type { UploadedDocItem } from "./types";

interface DocFileListProps {
  files: UploadedDocItem[];
  onRemove: (file: UploadedDocItem) => void;
}

export default function DocFileList({ files, onRemove }: DocFileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((file, idx) => (
        <div
          key={file.file_path || file.id || idx}
          className="flex items-center gap-3 p-3 bg-muted/20 hover:bg-muted/40 rounded-xl border border-border/70 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-primary shrink-0">
            {file.is_external_link ? (
              <LinkIcon className="w-4 h-4 text-sky-500" />
            ) : (
              <FileText className="w-4 h-4 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-foreground truncate">
                {file.file_name}
              </p>
              {file.is_external_link && (
                <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 rounded font-medium">
                  Cloud Link
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
              {!file.is_external_link && file.file_size ? (
                <span>{formatFileSize(file.file_size)}</span>
              ) : null}
              {file.is_external_link && (
                <span className="truncate max-w-xs">{file.file_path}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {file.signed_url && (
              <a
                href={file.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Buka / Unduh berkas"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={() => onRemove(file)}
              className="p-1.5 rounded-lg border border-border/80 bg-background hover:bg-rose-50 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
              title="Hapus berkas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
