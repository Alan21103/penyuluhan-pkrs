"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/DatePicker";
import SignaturePad from "@/components/penyuluhan/SignaturePad";
import UploadDokumen from "@/components/penyuluhan/UploadDokumen";
import {
  CHECKLIST_ITEMS_DEFAULT,
  type ChecklistItem,
  type MetodePenyuluhan,
  type MediaPenyuluhan,
  type MetodeVerifikasi,
  type JenisDokumen,
} from "@/types/penyuluhan";
import {
  Save, CheckCircle, Plus, Trash2, ChevronLeft,
  Info, ListChecks, BookOpen, ClipboardCheck, BarChart3, PenLine,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
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

interface FormPenyuluhanProps {
  mode: "create" | "edit";
  userId: string;
  initialData?: Partial<FormData> & { id?: string; status?: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METODE_OPTIONS: MetodePenyuluhan[] = ["Ceramah", "Diskusi", "Demonstrasi", "Simulasi", "Praktik"];
const MEDIA_OPTIONS: MediaPenyuluhan[] = ["Leaflet", "Poster", "PPT", "Video", "Alat Peraga", "Lainnya"];
const METODE_VERIFIKASI_OPTIONS: MetodeVerifikasi[] = ["Teach Back", "Tanya Jawab", "Post-test", "Demonstrasi", "Praktik Langsung"];
const JENIS_DOKUMEN_OPTIONS: JenisDokumen[] = ["Daftar Hadir", "Foto Kegiatan", "Materi Edukasi", "Hasil Evaluasi", "Dokumentasi Lainnya"];

const NAV_SECTIONS = [
  { id: "A", label: "Identitas Kegiatan", sub: "Data dasar penyuluhan", icon: Info },
  { id: "B", label: "Tujuan", sub: "Tujuan penyuluhan", icon: ListChecks },
  { id: "C", label: "Materi Pokok", sub: "Materi disampaikan", icon: BookOpen },
  { id: "D", label: "Pelaksanaan", sub: "Checklist 9 item", icon: ClipboardCheck },
  { id: "EFG", label: "Evaluasi & Dok", sub: "Hasil & dokumentasi", icon: BarChart3 },
  { id: "TTD", label: "Pengesahan", sub: "Tanda tangan", icon: PenLine },
];

const DEFAULT_FORM: FormData = {
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

// ─── Helper Components ────────────────────────────────────────────────────────

function SectionCard({ id, label, icon: Icon, children }: {
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

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

function InputField({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
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

function TextareaField({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
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

function MultiCheckbox<T extends string>({
  options, value, onChange, id,
}: { options: T[]; value: T[]; onChange: (v: T[]) => void; id: string }) {
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
            "px-3 py-1.5 rounded-xl text-sm font-medium border transition-all",
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

// ─── Main Form Component ──────────────────────────────────────────────────────

export default function FormPenyuluhan({ mode, userId, initialData }: FormPenyuluhanProps) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<FormData>({
    ...DEFAULT_FORM,
    ...(initialData ? {
      hari_tanggal: initialData.hari_tanggal ?? "",
      waktu_mulai: initialData.waktu_mulai ?? "",
      waktu_selesai: initialData.waktu_selesai ?? "",
      tempat: initialData.tempat ?? "",
      topik: initialData.topik ?? "",
      sasaran: initialData.sasaran ?? "",
      jumlah_peserta: initialData.jumlah_peserta ?? 0,
      penyuluh: (initialData.penyuluh as string[]) ?? [""],
      unit_instansi: initialData.unit_instansi ?? "",
      durasi: initialData.durasi ?? 0,
      metode: (initialData.metode as MetodePenyuluhan[]) ?? [],
      media: (initialData.media as MediaPenyuluhan[]) ?? [],
      media_lainnya: initialData.media_lainnya ?? "",
      tujuan_penyuluhan: (initialData.tujuan_penyuluhan as string[]) ?? [""],
      materi_disampaikan: (initialData.materi_disampaikan as string[]) ?? [""],
      checklist_evaluasi: (initialData.checklist_evaluasi as ChecklistItem[]) ?? CHECKLIST_ITEMS_DEFAULT.map(i => ({ ...i })),
      jumlah_peserta_e: initialData.jumlah_peserta_e ?? 0,
      jumlah_paham: initialData.jumlah_paham ?? 0,
      metode_verifikasi: (initialData.metode_verifikasi as MetodeVerifikasi[]) ?? [],
      hal_baik: initialData.hal_baik ?? "",
      kendala: initialData.kendala ?? "",
      rencana_tindak_lanjut: initialData.rencana_tindak_lanjut ?? "",
      dokumen_checklist: (initialData.dokumen_checklist as JenisDokumen[]) ?? [],
      pj_pkrs_nama: initialData.pj_pkrs_nama ?? "",
      pj_pkrs_nip: initialData.pj_pkrs_nip ?? "",
      pj_pkrs_ttd_url: (initialData as any).pj_pkrs_ttd_url ?? "",
      penyuluh_nama: initialData.penyuluh_nama ?? "",
      penyuluh_nip: initialData.penyuluh_nip ?? "",
      penyuluh_ttd_url: (initialData as any).penyuluh_ttd_url ?? "",
    } : {}),
  });

  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("A");
  const contentRef = useRef<HTMLDivElement>(null);

  // Track active section via scroll spy
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const handleScroll = () => {
      const sectionIds = ["section-A", "section-B", "section-C", "section-D", "section-EFG", "section-TTD"];
      const scrollTop = container.scrollTop;
      let found = "A";
      for (const sId of sectionIds) {
        const el = document.getElementById(sId);
        if (el) {
          // offsetTop relatif ke parent yang scrollable
          const elTop = el.offsetTop - container.offsetTop;
          if (scrollTop >= elTop - 80) {
            found = sId.replace("section-", "");
          }
        }
      }
      setActiveSection(found);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el && contentRef.current) {
      contentRef.current.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
    }
  };

  const set = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  const pctPemahaman =
    form.jumlah_peserta_e > 0
      ? Math.round((form.jumlah_paham / form.jumlah_peserta_e) * 100)
      : 0;

  const handleSave = async (status: "draft" | "selesai") => {
    setSaving(true);

    // Bersihkan array dari string kosong
    const cleanArr = (arr: string[]) => arr.filter(s => s.trim() !== "");

    const payload: Record<string, unknown> = {
      hari_tanggal: form.hari_tanggal || null,
      waktu_mulai: form.waktu_mulai || null,
      waktu_selesai: form.waktu_selesai || null,
      tempat: form.tempat,
      topik: form.topik,
      sasaran: form.sasaran,
      jumlah_peserta: form.jumlah_peserta,
      penyuluh: cleanArr(form.penyuluh),
      unit_instansi: form.unit_instansi,
      durasi: form.durasi,
      metode: form.metode,
      media: form.media,
      media_lainnya: form.media_lainnya || null,
      tujuan_penyuluhan: cleanArr(form.tujuan_penyuluhan),
      materi_disampaikan: cleanArr(form.materi_disampaikan),
      checklist_evaluasi: form.checklist_evaluasi,
      jumlah_peserta_e: form.jumlah_peserta_e,
      jumlah_paham: form.jumlah_paham,
      metode_verifikasi: form.metode_verifikasi,
      hal_baik: form.hal_baik,
      kendala: form.kendala,
      rencana_tindak_lanjut: form.rencana_tindak_lanjut,
      dokumen_checklist: form.dokumen_checklist,
      pj_pkrs_nama: form.pj_pkrs_nama,
      pj_pkrs_nip: form.pj_pkrs_nip,
      pj_pkrs_ttd_url: form.pj_pkrs_ttd_url || null,
      penyuluh_nama: form.penyuluh_nama,
      penyuluh_nip: form.penyuluh_nip,
      penyuluh_ttd_url: form.penyuluh_ttd_url || null,
      status,
    };

    // Hanya kirim created_by saat create
    if (mode === "create") {
      payload.created_by = userId;
    }

    let error;
    if (mode === "edit" && initialData?.id) {
      ({ error } = await supabase.from("penyuluhan").update(payload).eq("id", initialData.id));
    } else {
      ({ error } = await supabase.from("penyuluhan").insert(payload));
    }

    setSaving(false);
    if (!error) {
      router.push("/penyuluhan");
      router.refresh();
    } else {
      console.error("Supabase error:", error);
      alert("Gagal menyimpan: " + error.message);
    }
  };

  // Dynamic list helpers
  const addItem = (key: "tujuan_penyuluhan" | "materi_disampaikan" | "penyuluh") => {
    set(key, [...form[key], ""]);
  };
  const updateItem = (key: "tujuan_penyuluhan" | "materi_disampaikan" | "penyuluh", idx: number, val: string) => {
    const arr = [...form[key]];
    arr[idx] = val;
    set(key, arr);
  };
  const removeItem = (key: "tujuan_penyuluhan" | "materi_disampaikan" | "penyuluh", idx: number) => {
    set(key, form[key].filter((_, i) => i !== idx));
  };

  return (
    <div className="flex h-full">
      {/* ── Left Stepper Nav (Desktop lg+) ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-card h-full overflow-y-auto">
        {/* Back + Title */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => router.push("/penyuluhan")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 cursor-pointer"
            id="btn-back-penyuluhan"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali
          </button>
          <p className="text-xs font-semibold text-foreground leading-tight">Formulir Pelaksanaan</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
            Penyuluhan Kelompok PKRS
          </p>
        </div>

        {/* Steps */}
        <nav className="p-3 space-y-0.5">
          {NAV_SECTIONS.map((sec, i) => {
            const isActive = activeSection === sec.id;
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                id={`nav-section-${sec.id}`}
                onClick={() => scrollTo(sec.id)}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {/* Circle badge */}
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                  isActive
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border text-muted-foreground bg-background"
                )}>
                  {sec.id === "EFG" ? "…" : sec.id === "TTD" ? "✎" : sec.id}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-xs font-semibold leading-tight", isActive ? "text-primary" : "text-foreground/80")}>
                    {sec.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{sec.sub}</p>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Right: Form Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/penyuluhan")}
              className="lg:hidden p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground mr-1 shrink-0"
              title="Kembali"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight">Formulir Pelaksanaan</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Penyuluhan Kelompok Promosi Kesehatan Rumah Sakit (PKRS)</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              id="btn-simpan-draft"
              className="rounded-xl gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm h-9 sm:h-10"
              onClick={() => handleSave("draft")}
              disabled={saving}
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Simpan Draft</span>
            </Button>
            <Button
              id="btn-selesai"
              className="rounded-xl gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-initial text-xs sm:text-sm h-9 sm:h-10"
              onClick={() => handleSave("selesai")}
              disabled={saving}
            >
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{saving ? "Menyimpan..." : "Simpan & Selesai"}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Horizontal Stepper Navigation (< lg) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2 bg-muted/40 border-b border-border scrollbar-none shrink-0">
          {NAV_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{sec.id === "EFG" ? "E-G" : sec.id === "TTD" ? "TTD" : sec.id}.</span>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable form area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">

          {/* ══ SECTION A — Identitas Kegiatan ══ */}
          <SectionCard id="A" label="Identitas Kegiatan" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <FieldLabel required>Tanggal Pelaksanaan</FieldLabel>
                <DatePicker
                  id="input-hari-tanggal"
                  value={form.hari_tanggal}
                  onChange={(val) => set("hari_tanggal", val)}
                  placeholder="Pilih tanggal"
                  locale="id"
                />
              </div>
              <div>
                <FieldLabel required>Waktu Mulai</FieldLabel>
                <InputField id="input-waktu-mulai" type="time" value={form.waktu_mulai}
                  onChange={e => set("waktu_mulai", e.target.value)} />
              </div>
              <div>
                <FieldLabel required>Waktu Selesai</FieldLabel>
                <InputField id="input-waktu-selesai" type="time" value={form.waktu_selesai}
                  onChange={e => set("waktu_selesai", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel required>Ruang / Lokasi</FieldLabel>
                <InputField id="input-tempat" placeholder="Ruang Perawatan / Poliklinik / dll"
                  value={form.tempat} onChange={e => set("tempat", e.target.value)} />
              </div>
              <div>
                <FieldLabel required>Unit / Instansi</FieldLabel>
                <InputField id="input-unit-instansi" placeholder="Nama unit/ruangan"
                  value={form.unit_instansi} onChange={e => set("unit_instansi", e.target.value)} />
              </div>
            </div>

            <div className="mb-4">
              <FieldLabel required>Topik Penyuluhan</FieldLabel>
              <InputField id="input-topik" placeholder="Masukkan judul / topik materi penyuluhan"
                value={form.topik} onChange={e => set("topik", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel required>Sasaran</FieldLabel>
                <InputField id="input-sasaran" placeholder="Pasien & Keluarga / Pengunjung / dll"
                  value={form.sasaran} onChange={e => set("sasaran", e.target.value)} />
              </div>
              <div>
                <FieldLabel required>Estimasi Peserta</FieldLabel>
                <div className="relative">
                  <InputField id="input-jumlah-peserta" type="number" min={0}
                    value={form.jumlah_peserta || ""}
                    onChange={e => set("jumlah_peserta", e.target.value === "" ? 0 : Number(e.target.value))}
                    className="pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Orang</span>
                </div>
              </div>
            </div>

            {/* Penyuluh (dynamic) */}
            <div className="mb-4">
              <FieldLabel required>Nama Penyuluh</FieldLabel>
              <div className="space-y-2">
                {form.penyuluh.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <InputField
                      id={`input-penyuluh-${i}`}
                      placeholder={`Nama staf medis/edukator ${i + 1}`}
                      value={p}
                      onChange={e => updateItem("penyuluh", i, e.target.value)}
                    />
                    {form.penyuluh.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem("penyuluh", i)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  id="btn-tambah-penyuluh"
                  onClick={() => addItem("penyuluh")}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Penyuluh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel>Durasi (menit)</FieldLabel>
                <InputField id="input-durasi" type="number" min={0}
                  value={form.durasi || ""}
                  onChange={e => set("durasi", e.target.value === "" ? 0 : Number(e.target.value))}
                  placeholder="Contoh: 30" />
              </div>
            </div>

            <div className="mb-4">
              <FieldLabel>Metode Penyuluhan</FieldLabel>
              <MultiCheckbox
                id="metode"
                options={METODE_OPTIONS}
                value={form.metode}
                onChange={v => set("metode", v)}
              />
            </div>

            <div>
              <FieldLabel>Media yang Digunakan</FieldLabel>
              <MultiCheckbox
                id="media"
                options={MEDIA_OPTIONS}
                value={form.media}
                onChange={v => set("media", v)}
              />
              {form.media.includes("Lainnya") && (
                <div className="mt-2">
                  <InputField
                    id="input-media-lainnya"
                    placeholder="Sebutkan media lainnya..."
                    value={form.media_lainnya}
                    onChange={e => set("media_lainnya", e.target.value)}
                  />
                </div>
              )}
            </div>
          </SectionCard>

          {/* ══ SECTION B — Tujuan Penyuluhan ══ */}
          <SectionCard id="B" label="Tujuan Penyuluhan" icon={ListChecks}>
            <div className="space-y-2">
              {form.tujuan_penyuluhan.map((t, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="w-6 h-10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                    {i + 1}.
                  </span>
                  <InputField
                    id={`input-tujuan-${i}`}
                    value={t}
                    onChange={e => updateItem("tujuan_penyuluhan", i, e.target.value)}
                    placeholder={i === 0 ? "Peserta dapat memahami definisi penyakit secara umum." : "Ketik tujuan spesifik lainnya..."}
                  />
                  {form.tujuan_penyuluhan.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem("tujuan_penyuluhan", i)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              id="btn-tambah-tujuan"
              onClick={() => addItem("tujuan_penyuluhan")}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/40 text-sm text-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah Tujuan
            </button>
          </SectionCard>

          {/* ══ SECTION C — Materi yang Disampaikan ══ */}
          <SectionCard id="C" label="Materi yang Disampaikan" icon={BookOpen}>
            <div className="space-y-2">
              {form.materi_disampaikan.map((m, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="w-6 h-10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                    {i + 1}.
                  </span>
                  <InputField
                    id={`input-materi-${i}`}
                    value={m}
                    onChange={e => updateItem("materi_disampaikan", i, e.target.value)}
                    placeholder="Ketik poin materi yang disampaikan..."
                  />
                  {form.materi_disampaikan.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem("materi_disampaikan", i)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              id="btn-tambah-materi"
              onClick={() => addItem("materi_disampaikan")}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/40 text-sm text-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah Materi
            </button>
          </SectionCard>

          {/* ══ SECTION D — Pelaksanaan (Checklist) ══ */}
          <SectionCard id="D" label="Pelaksanaan — Checklist Evaluasi Proses" icon={ClipboardCheck}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground w-6">No</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground">Item Evaluasi</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground w-16">Ya</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground w-16">Tidak</th>
                    <th className="text-left py-2 pl-3 text-xs font-semibold text-muted-foreground">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {form.checklist_evaluasi.map((item, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 pr-4 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="py-3 pr-4 text-foreground/90">{item.item}</td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          id={`checklist-ya-${i}`}
                          checked={item.ya}
                          onChange={e => {
                            const cl = [...form.checklist_evaluasi];
                            cl[i] = { ...cl[i], ya: e.target.checked, tidak: e.target.checked ? false : cl[i].tidak };
                            set("checklist_evaluasi", cl);
                          }}
                          className="w-4 h-4 rounded accent-primary cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          id={`checklist-tidak-${i}`}
                          checked={item.tidak}
                          onChange={e => {
                            const cl = [...form.checklist_evaluasi];
                            cl[i] = { ...cl[i], tidak: e.target.checked, ya: e.target.checked ? false : cl[i].ya };
                            set("checklist_evaluasi", cl);
                          }}
                          className="w-4 h-4 rounded accent-primary cursor-pointer"
                        />
                      </td>
                      <td className="py-3 pl-3">
                        <InputField
                          id={`checklist-ket-${i}`}
                          placeholder="Keterangan (opsional)"
                          value={item.keterangan}
                          onChange={e => {
                            const cl = [...form.checklist_evaluasi];
                            cl[i] = { ...cl[i], keterangan: e.target.value };
                            set("checklist_evaluasi", cl);
                          }}
                          className="h-8 text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* ══ SECTION EFG — Evaluasi & Dokumentasi ══ */}
          <SectionCard id="EFG" label="Evaluasi & Dokumentasi" icon={BarChart3}>

            {/* E — Verifikasi Pemahaman */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="inline-flex w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold items-center justify-center">E</span>
                Hasil Verifikasi Pemahaman
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <FieldLabel>Jumlah Peserta</FieldLabel>
                  <InputField id="input-jml-peserta-e" type="number" min={0}
                    value={form.jumlah_peserta_e || ""}
                    onChange={e => set("jumlah_peserta_e", e.target.value === "" ? 0 : Number(e.target.value))} />
                </div>
                <div>
                  <FieldLabel>Jumlah Paham</FieldLabel>
                  <InputField id="input-jml-paham" type="number" min={0}
                    value={form.jumlah_paham || ""}
                    onChange={e => set("jumlah_paham", e.target.value === "" ? 0 : Number(e.target.value))} />
                </div>
                <div>
                  <FieldLabel>Persentase Pemahaman</FieldLabel>
                  <div className={cn(
                    "h-10 px-3 rounded-xl border flex items-center justify-between text-sm font-semibold",
                    pctPemahaman >= 70
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-amber-50 border-amber-200 text-amber-700"
                  )}>
                    <span>{pctPemahaman}%</span>
                    <span className="text-xs font-normal">{pctPemahaman >= 70 ? "Baik ✓" : "Perlu Perhatian"}</span>
                  </div>
                </div>
              </div>
              <div>
                <FieldLabel>Metode Verifikasi</FieldLabel>
                <MultiCheckbox
                  id="metode-verifikasi"
                  options={METODE_VERIFIKASI_OPTIONS}
                  value={form.metode_verifikasi}
                  onChange={v => set("metode_verifikasi", v)}
                />
              </div>
            </div>

            <div className="border-t border-border/60 pt-6 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="inline-flex w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold items-center justify-center">F</span>
                Hasil Evaluasi
              </h3>
              <div className="space-y-4">
                <div>
                  <FieldLabel>Hal yang Sudah Baik</FieldLabel>
                  <TextareaField id="input-hal-baik" rows={3}
                    placeholder="Uraikan hal-hal yang sudah berjalan dengan baik..."
                    value={form.hal_baik}
                    onChange={e => set("hal_baik", e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Kendala</FieldLabel>
                  <TextareaField id="input-kendala" rows={3}
                    placeholder="Uraikan kendala yang dihadapi..."
                    value={form.kendala}
                    onChange={e => set("kendala", e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Rencana Tindak Lanjut</FieldLabel>
                  <TextareaField id="input-rtl" rows={3}
                    placeholder="Uraikan rencana tindak lanjut..."
                    value={form.rencana_tindak_lanjut}
                    onChange={e => set("rencana_tindak_lanjut", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="inline-flex w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold items-center justify-center">G</span>
                Dokumentasi
              </h3>
              <FieldLabel>Jenis Dokumen yang Tersedia</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {JENIS_DOKUMEN_OPTIONS.map(jenis => (
                  <button
                    key={jenis}
                    type="button"
                    id={`dok-${jenis}`}
                    onClick={() => {
                      const cur = form.dokumen_checklist;
                      set("dokumen_checklist",
                        cur.includes(jenis) ? cur.filter(x => x !== jenis) : [...cur, jenis]
                      );
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-sm font-medium border transition-all",
                      form.dokumen_checklist.includes(jenis)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {jenis}
                  </button>
                ))}
              </div>

              {/* Upload file — hanya tersedia setelah data disimpan (edit mode) */}
              {mode === "edit" && initialData?.id ? (
                <UploadDokumen
                  penyuluhanId={initialData.id}
                  userId={userId}
                  dokumenChecklist={form.dokumen_checklist}
                />
              ) : (
                form.dokumen_checklist.length > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground italic">
                    Simpan data terlebih dahulu untuk dapat mengupload file dokumentasi.
                  </p>
                )
              )}
            </div>
          </SectionCard>

          {/* ══ SECTION TTD — Pengesahan ══ */}
          <SectionCard id="TTD" label="Tanda Tangan & Pengesahan" icon={PenLine}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PJ PKRS */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Penanggung Jawab PKRS</h3>
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Nama</FieldLabel>
                    <InputField id="input-pj-nama" placeholder="Nama lengkap PJ PKRS"
                      value={form.pj_pkrs_nama} onChange={e => set("pj_pkrs_nama", e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>NIP</FieldLabel>
                    <InputField id="input-pj-nip" placeholder="Nomor Induk Pegawai"
                      value={form.pj_pkrs_nip} onChange={e => set("pj_pkrs_nip", e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>Tanda Tangan</FieldLabel>
                    <SignaturePad
                      id="ttd-pj-pkrs"
                      label="PJ PKRS"
                      value={form.pj_pkrs_ttd_url || undefined}
                      onChange={(v) => set("pj_pkrs_ttd_url", v ?? "")}
                    />
                  </div>
                </div>
              </div>

              {/* Penyuluh */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Penyuluh</h3>
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Nama</FieldLabel>
                    <InputField id="input-penyuluh-ttd-nama" placeholder="Nama lengkap penyuluh"
                      value={form.penyuluh_nama} onChange={e => set("penyuluh_nama", e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>NIP</FieldLabel>
                    <InputField id="input-penyuluh-ttd-nip" placeholder="Nomor Induk Pegawai"
                      value={form.penyuluh_nip} onChange={e => set("penyuluh_nip", e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>Tanda Tangan</FieldLabel>
                    <SignaturePad
                      id="ttd-penyuluh"
                      label="Penyuluh"
                      value={form.penyuluh_ttd_url || undefined}
                      onChange={(v) => set("penyuluh_ttd_url", v ?? "")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom action (duplikat di bawah form) */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline" id="btn-draft-bottom" className="rounded-xl gap-2 w-full sm:w-auto"
                onClick={() => handleSave("draft")} disabled={saving}>
                <Save className="w-4 h-4" /> Simpan Draft
              </Button>
              <Button id="btn-submit-bottom" className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                onClick={() => handleSave("selesai")} disabled={saving}>
                <CheckCircle className="w-4 h-4" />
                {saving ? "Menyimpan..." : "Simpan & Selesai"}
              </Button>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
