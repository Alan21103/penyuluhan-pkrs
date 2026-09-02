import React, { useState } from "react";
import { Link as LinkIcon, Loader2, Plus } from "lucide-react";
import type { JenisDokumen } from "@/types/penyuluhan";

interface DocCloudLinkFormProps {
  jenis: JenisDokumen;
  onClose: () => void;
  onSubmit: (title: string, url: string) => Promise<void>;
}

export default function DocCloudLinkForm({ jenis, onClose, onSubmit }: DocCloudLinkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      await onSubmit(title.trim(), url.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-muted/40 border-b border-border/60 animate-in fade-in-50 duration-200">
      <div className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
        <LinkIcon className="w-3.5 h-3.5 text-primary" />
        Lampirkan Tautan Cloud (Google Drive / YouTube / Canva) untuk {jenis}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <input
          type="text"
          placeholder={`Judul Tautan (cth: Slide Presentasi ${jenis})`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 px-2.5 text-xs rounded-lg border border-input bg-background"
        />
        <input
          type="url"
          placeholder="https://drive.google.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-8 px-2.5 text-xs rounded-lg border border-input bg-background"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 text-xs rounded-md text-muted-foreground hover:bg-muted cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          disabled={loading || !url.trim()}
          onClick={handleSubmit}
          className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50 flex items-center gap-1 cursor-pointer"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Simpan Tautan
        </button>
      </div>
    </div>
  );
}
