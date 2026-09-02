import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

interface DocImageLightboxProps {
  preview: { url: string; title: string } | null;
  onClose: () => void;
}

export default function DocImageLightbox({ preview, onClose }: DocImageLightboxProps) {
  if (!preview) return null;

  return (
    <Dialog open={!!preview} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-zinc-950/95 border-zinc-800 text-white">
        <DialogHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between">
          <DialogTitle className="text-sm font-medium text-zinc-200 truncate pr-6">
            {preview.title}
          </DialogTitle>
        </DialogHeader>
        <div className="p-2 flex items-center justify-center max-h-[75vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt={preview.title}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>
        <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex justify-end">
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            download={preview.title}
            className="text-xs px-3 py-1.5 bg-primary text-primary-foreground font-medium rounded-lg flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Buka Ukuran Penuh
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
