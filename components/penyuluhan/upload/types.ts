import type { JenisDokumen } from "@/types/penyuluhan";
import { FileText, ImageIcon, File } from "lucide-react";

export interface UploadedDocItem {
  id?: string;
  jenis: JenisDokumen;
  file?: File;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  is_external_link?: boolean;
  signed_url?: string;
  compression_ratio?: number;
}

export interface UploadDokumenProps {
  penyuluhanId?: string;
  userId: string;
  dokumenChecklist: JenisDokumen[];
  mode?: "create" | "edit";
  stagedFiles?: UploadedDocItem[];
  existingFiles?: UploadedDocItem[];
  onUploadComplete?: (files: UploadedDocItem[]) => void;
  onStagedFilesChange?: (files: UploadedDocItem[]) => void;
}

export const JENIS_ICON: Record<JenisDokumen, React.ElementType> = {
  "Daftar Hadir": FileText,
  "Foto Kegiatan": ImageIcon,
  "Materi Edukasi": FileText,
  "Hasil Evaluasi": FileText,
  "Dokumentasi Lainnya": File,
};

export const MAX_DOC_SIZE_MB = 3; // Batas dokumen non-foto maks 3 MB untuk menghemat storage
