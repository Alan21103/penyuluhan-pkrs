"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Info, ListChecks, BookOpen, ClipboardCheck, BarChart3, PenLine } from "lucide-react";
import {
  CHECKLIST_ITEMS_DEFAULT,
  type ChecklistItem,
  type MetodePenyuluhan,
  type MediaPenyuluhan,
  type MetodeVerifikasi,
  type JenisDokumen,
} from "@/types/penyuluhan";

// ─── Form Data Type ───────────────────────────────────────────────────────────

export interface FormData {
  // A
  hari_tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  tempat: string;
  topik: string;
  sasaran: string;
  jumlah_peserta: number;
  penyuluh: string[];
  unit_instansi: string;
  durasi: number;
  metode: MetodePenyuluhan[];
  media: MediaPenyuluhan[];
  media_lainnya: string;
  // B
  tujuan_penyuluhan: string[];
  // C
  materi_disampaikan: string[];
  // D
  checklist_evaluasi: ChecklistItem[];
  // E
  jumlah_peserta_e: number;
  jumlah_paham: number;
  metode_verifikasi: MetodeVerifikasi[];
  // F
  hal_baik: string;
  kendala: string;
  rencana_tindak_lanjut: string;
  // G
  dokumen_checklist: JenisDokumen[];
  pj_pkrs_nama: string;
  pj_pkrs_nip: string;
  pj_pkrs_ttd_url: string;
  penyuluh_nama: string;
  penyuluh_nip: string;
  penyuluh_ttd_url: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const SASARAN_OPTIONS = [
  "Pasien & Keluarga Pasien",
  "Pengunjung",
  "Petugas",
  "Komunitas",
] as const;

export const METODE_OPTIONS: MetodePenyuluhan[] = ["Ceramah", "Diskusi", "Demonstrasi", "Simulasi", "Praktik"];
export const MEDIA_OPTIONS: MediaPenyuluhan[] = ["Leaflet", "Poster", "PPT", "Video", "Alat Peraga", "Lainnya"];
export const METODE_VERIFIKASI_OPTIONS: MetodeVerifikasi[] = ["Teach Back", "Tanya Jawab", "Post-test", "Demonstrasi", "Praktik Langsung"];
export const JENIS_DOKUMEN_OPTIONS: JenisDokumen[] = ["Daftar Hadir", "Foto Kegiatan", "Materi Edukasi", "Hasil Evaluasi", "Dokumentasi Lainnya"];

export const NAV_SECTIONS = [
  { id: "A", label: "Identitas Kegiatan", sub: "Data dasar penyuluhan", icon: Info },
  { id: "B", label: "Tujuan", sub: "Tujuan penyuluhan", icon: ListChecks },
  { id: "C", label: "Materi Pokok", sub: "Materi disampaikan", icon: BookOpen },
  { id: "D", label: "Pelaksanaan", sub: "Checklist 9 item", icon: ClipboardCheck },
  { id: "EFG", label: "Evaluasi & Dok", sub: "Hasil & dokumentasi", icon: BarChart3 },
  { id: "TTD", label: "Pengesahan", sub: "Tanda tangan", icon: PenLine },
];

export const DEFAULT_FORM: FormData = {
  hari_tanggal: "", waktu_mulai: "", waktu_selesai: "",
  tempat: "", topik: "", sasaran: "", jumlah_peserta: 0,
  penyuluh: [""], unit_instansi: "", durasi: 0,
  metode: [], media: [], media_lainnya: "",
  tujuan_penyuluhan: [""],
  materi_disampaikan: [""],
  checklist_evaluasi: CHECKLIST_ITEMS_DEFAULT.map(i => ({ ...i })),
  jumlah_peserta_e: 0, jumlah_paham: 0, metode_verifikasi: [],
  hal_baik: "", kendala: "", rencana_tindak_lanjut: "",
  dokumen_checklist: [], pj_pkrs_nama: "", pj_pkrs_nip: "",
  pj_pkrs_ttd_url: "",
  penyuluh_nama: "", penyuluh_nip: "",
  penyuluh_ttd_url: "",
};

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

export function SectionCard({ id, label, icon: Icon, children }: {
  id: string; label: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div id={`section-${id}`} className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 shadow-xs">
      <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-muted/20">
        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center shrink-0">
          {id === "EFG" ? "E–G" : id === "TTD" ? "✎" : id}
        </span>
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
          <h2 className="text-sm sm:text-base font-semibold text-foreground truncate">{label}</h2>
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

export function InputField({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-sm",
        "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring",
        "transition-colors disabled:opacity-50",
        className
      )}
    />
  );
}

export function TextareaField({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm",
        "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring",
        "resize-none transition-colors",
        className
      )}
    />
  );
}

export function SelectField({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          "w-full h-10 px-3 pr-9 rounded-xl border border-input bg-background text-foreground text-sm appearance-none cursor-pointer",
          "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring",
          "transition-colors disabled:opacity-50",
          className
        )}
      >
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

export function MultiCheckbox<T extends string>({
  options, value, onChange, id,
}: { options: readonly T[] | T[]; value: T[]; onChange: (v: T[]) => void; id: string }) {
  const toggle = (opt: T) => {
    onChange(value.includes(opt) ? value.filter(x => x !== opt) : [...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          id={`${id}-${opt}`}
          onClick={() => toggle(opt)}
          className={cn(
            "px-3 py-1.5 rounded-xl text-sm font-medium border transition-all cursor-pointer",
            value.includes(opt)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
