"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  FileText,
  ListPlus,
  CheckCircle,
  Save,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import type { LaporanMediaEdukasi, MediaEdukasiItem, StatusMediaEdukasi } from "@/types/media-edukasi";
import { JENIS_MEDIA_OPTIONS, BENTUK_MEDIA_OPTIONS, LOKASI_PLATFORM_OPTIONS, SASARAN_OPTIONS } from "@/types/media-edukasi";
import { mediaEdukasiService } from "@/services/media-edukasi.service";
import SelectWithLainnya from "@/components/shared/SelectWithLainnya";
import MultiSelectCheckboxes from "@/components/shared/MultiSelectCheckboxes";
import NumericStepperInput from "@/components/shared/NumericStepperInput";
import DatePicker from "@/components/ui/DatePicker";

// ─── Daftar Bagian (Sections) Sesuai Urutan ──────────────────────────────────
const SECTIONS = [
  { id: 'A', letter: 'A', label: 'Identitas', sub: 'Data laporan', icon: FileText },
  { id: 'B', letter: 'B', label: 'Media Edukasi', sub: 'Daftar media', icon: ListPlus },
];

function SectionCard({
  id,
  letter,
  label,
  children,
  className,
}: {
  id: string;
  letter: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      id={`sec-${id}`}
      className={cn(
        "relative rounded-2xl border border-border bg-card shadow-xs mb-6 scroll-mt-6 focus-within:z-30",
        className
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/20 rounded-t-2xl">
        <span className="w-6 h-6 rounded-md bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
          {letter}
        </span>
        <h2 className="font-semibold text-sm text-foreground">{label}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

function InputField({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
    />
  );
}

function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
}: {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// ─── Default State ───────────────────────────────────────────────────────────
function defaultForm(): Partial<LaporanMediaEdukasi> {
  return {
    periode_bulan: '',
    tahun: new Date().getFullYear().toString(),
    penanggung_jawab: '',
    petugas_pelaporan: '',
    items: [],
    status: 'draft',
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface MediaEdukasiFormProps {
  mode: "create" | "edit";
  initialData?: LaporanMediaEdukasi;
}

export default function MediaEdukasiForm({ mode, initialData }: MediaEdukasiFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<LaporanMediaEdukasi>>(
    initialData ? { ...initialData } : defaultForm()
  );

  const [activeSection, setActiveSection] = useState("A");
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const set = useCallback(<K extends keyof LaporanMediaEdukasi>(key: K, val: LaporanMediaEdukasi[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  // Scroll spy tracking for active section in strict sequential order
  const sectionIds = useMemo(() => ["A", "B"], []);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      let found = "A";

      for (const sId of sectionIds) {
        const el = document.getElementById(`sec-${sId}`);
        if (el) {
          const elTop = el.offsetTop - container.offsetTop;
          if (scrollTop >= elTop - 80) {
            found = sId;
          }
        }
      }
      setActiveSection(found);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [sectionIds]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(`sec-${id}`);
    if (el && contentRef.current) {
      const targetTop = el.offsetTop - contentRef.current.offsetTop - 16;
      contentRef.current.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
      setActiveSection(id);
    }
  }, []);

  // Save
  const handleSave = async (status: StatusMediaEdukasi) => {
    setSaving(true);
    const payload = { ...form, status };

    try {
      if (mode === "create") {
        const { data, error } = await mediaEdukasiService.create(payload as any);
        if (error || !data) throw new Error(error ?? "Gagal menyimpan");
        router.push(`/media-edukasi/${data.id}`);
      } else {
        const { error } = await mediaEdukasiService.update(initialData!.id, payload as any);
        if (error) throw new Error(error);
        router.push(`/media-edukasi/${initialData!.id}`);
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const items = (form.items ?? []) as MediaEdukasiItem[];
  
  const addItem = () =>
    set(
      "items",
      [
        ...items,
        {
          id: crypto.randomUUID(),
          tanggal_nomor: '',
          jenis_media: '',
          bentuk_media: '',
          judul_materi: '',
          lokasi_platform: '',
          jumlah_distribusi: 0,
          sasaran: '',
        },
      ] as any
    );

  const removeItem = (id: string) =>
    set("items", items.filter((t) => t.id !== id) as any);

  const setItem = (id: string, field: keyof MediaEdukasiItem, val: string | number) =>
    set(
      "items",
      items.map((t) => (t.id === id ? { ...t, [field]: val } : t)) as any
    );

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden bg-background">
      {/* ── Top Bar Sesuai Template Penyuluhan ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/media-edukasi"
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
              {mode === "create" ? "Formulir Baru" : "Edit Formulir"}
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate hidden xs:block">
              Laporan Media Edukasi PKRS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            id="btn-save-draft"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="gap-1.5 rounded-xl text-xs sm:text-sm h-9 px-3 sm:px-4 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Simpan </span>Draft
          </Button>
          <Button
            id="btn-save-finish"
            onClick={() => handleSave("selesai")}
            disabled={saving}
            className="gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm h-9 px-3 sm:px-4 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Selesai</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Main Layout: Sidebar + Form Content ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Sidebar Navigation ("Daftar Bagian") */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col border-r border-border bg-muted/10 p-4 shrink-0 overflow-y-auto">
          <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase px-3 mb-2">
            Daftar Bagian
          </p>
          <nav className="space-y-1">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  id={`nav-sec-${sec.id}`}
                  onClick={() => scrollTo(sec.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-normal"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {sec.letter}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs truncate">{sec.label}</div>
                    <div className="text-[10px] text-muted-foreground/80 truncate">{sec.sub}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area (Mobile Tabs + Unified Scroll Container) */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Mobile Horizontal Navigation Tabs */}
          <div className="lg:hidden flex overflow-x-auto gap-1.5 p-2 border-b border-border bg-muted/20 shrink-0">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background border border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{sec.letter}.</span>
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Single Unified Scrollable Form Content */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24"
          >
            <FormSections
              form={form}
              set={set}
              items={items}
              addItem={addItem}
              removeItem={removeItem}
              setItem={setItem}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Form Sections ────────────────────────────────────────────────────────────
interface FormSectionsProps {
  form: Partial<LaporanMediaEdukasi>;
  set: <K extends keyof LaporanMediaEdukasi>(key: K, val: LaporanMediaEdukasi[K]) => void;
  items: MediaEdukasiItem[];
  addItem: () => void;
  removeItem: (id: string) => void;
  setItem: (id: string, field: keyof MediaEdukasiItem, val: string | number) => void;
  onSave: (status: StatusMediaEdukasi) => void;
  saving: boolean;
}

function FormSections({
  form,
  set,
  items,
  addItem,
  removeItem,
  setItem,
  onSave,
  saving,
}: FormSectionsProps) {
  return (
    <>
      {/* Section A — Identitas Laporan */}
      <SectionCard id="A" letter="A" label="Identitas Laporan" className="z-30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Periode / Bulan</FieldLabel>
            <InputField
              id="input-periode"
              value={form.periode_bulan ?? ""}
              onChange={(e) => set("periode_bulan", e.target.value)}
              placeholder="contoh: Agustus"
            />
          </div>
          <div>
            <FieldLabel required>Tahun</FieldLabel>
            <InputField
              id="input-tahun"
              type="number"
              value={form.tahun ?? ""}
              onChange={(e) => set("tahun", e.target.value)}
              placeholder="contoh: 2026"
            />
          </div>
          <div>
            <FieldLabel required>Penanggung Jawab</FieldLabel>
            <InputField
              id="input-pj"
              value={form.penanggung_jawab ?? ""}
              onChange={(e) => set("penanggung_jawab", e.target.value)}
              placeholder="Nama penanggung jawab"
            />
          </div>
          <div>
            <FieldLabel required>Petugas Pelaporan</FieldLabel>
            <InputField
              id="input-petugas"
              value={form.petugas_pelaporan ?? ""}
              onChange={(e) => set("petugas_pelaporan", e.target.value)}
              placeholder="Nama petugas pelaporan"
            />
          </div>
        </div>
      </SectionCard>

      {/* Section B — Daftar Media Edukasi */}
      <SectionCard id="B" letter="B" label="Daftar Media Edukasi" className="z-20">
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-border bg-muted/10 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Media Edukasi #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Tanggal / Nomor Media</FieldLabel>
                  <DatePicker
                    value={item.tanggal_nomor}
                    onChange={(dateStr) => setItem(item.id, "tanggal_nomor", dateStr)}
                    placeholder="Pilih tanggal media..."
                    locale="id"
                  />
                </div>
                <div>
                  <FieldLabel required>Jenis Media</FieldLabel>
                  <SelectField
                    value={item.jenis_media}
                    onChange={(e) => setItem(item.id, "jenis_media", e.target.value)}
                    options={JENIS_MEDIA_OPTIONS}
                    placeholder="Pilih jenis media"
                  />
                </div>
                <div>
                  <FieldLabel required>Bentuk Media</FieldLabel>
                  <SelectField
                    value={item.bentuk_media}
                    onChange={(e) => setItem(item.id, "bentuk_media", e.target.value)}
                    options={BENTUK_MEDIA_OPTIONS}
                    placeholder="Pilih bentuk media"
                  />
                </div>
                <div>
                  <FieldLabel required>Judul / Materi</FieldLabel>
                  <InputField
                    value={item.judul_materi}
                    onChange={(e) => setItem(item.id, "judul_materi", e.target.value)}
                    placeholder="Judul atau topik materi"
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel required>Lokasi / Platform (Dapat Pilih Lebih dari Satu)</FieldLabel>
                  <MultiSelectCheckboxes
                    value={item.lokasi_platform}
                    onValueChange={(val) => setItem(item.id, "lokasi_platform", val)}
                    options={LOKASI_PLATFORM_OPTIONS}
                    customPlaceholder="Ketik lokasi/platform lainnya..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel required>Jumlah Distribusi / Tayangan</FieldLabel>
                  <NumericStepperInput
                    value={item.jumlah_distribusi}
                    onChange={(val) => setItem(item.id, "jumlah_distribusi", val)}
                    min={0}
                    unitLabel="Eks / Tayangan"
                    quickPresets={[10, 50, 100]}
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel required>Sasaran</FieldLabel>
                  <SelectField
                    value={item.sasaran}
                    onChange={(e) => setItem(item.id, "sasaran", e.target.value)}
                    options={SASARAN_OPTIONS}
                    placeholder="Pilih sasaran"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Media Edukasi
          </button>
        </div>
      </SectionCard>
    </>
  );
}
