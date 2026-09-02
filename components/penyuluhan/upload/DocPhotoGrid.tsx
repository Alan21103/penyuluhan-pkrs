import React from "react";
import { ImageIcon, Eye, Trash2 } from "lucide-react";
import { formatFileSize } from "@/lib/image-compression";
import type { UploadedDocItem } from "./types";

interface DocPhotoGridProps {
  files: UploadedDocItem[];
  onPreview: (file: UploadedDocItem) => void;
  onRemove: (file: UploadedDocItem) => void;
}

export default function DocPhotoGrid({ files, onPreview, onRemove }: DocPhotoGridProps) {
  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {files.map((file, idx) => (
        <div
          key={file.file_path || file.id || idx}
          className="group relative aspect-4/3 rounded-xl overflow-hidden border border-border bg-muted/30 hover:shadow-md transition-all"
        >
          {/* Thumbnail */}
          {file.signed_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.signed_url}
              alt={file.file_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}

          {/* Overlay action */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            {file.signed_url && (
              <button
                type="button"
                onClick={() => onPreview(file)}
                className="p-1.5 bg-white/90 hover:bg-white text-zinc-900 rounded-lg shadow-sm transition-transform hover:scale-110 cursor-pointer"
                title="Perbesar foto"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(file)}
              className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-transform hover:scale-110 cursor-pointer"
              title="Hapus foto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* File size badge */}
          {file.file_size ? (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs rounded text-[9px] text-white font-mono">
              {formatFileSize(file.file_size)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
