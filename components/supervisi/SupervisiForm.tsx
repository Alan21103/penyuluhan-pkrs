"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Shield,
  ClipboardCheck,
  BarChart3,
  Search,
  FileText,
  CheckCircle,
  Save,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  AlertCircle,
  TrendingUp,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SignaturePad from "@/components/penyuluhan/SignaturePad";
import { supervisiService } from "@/services/supervisi.service";
import type {
  SupervisiBulanan,
  ChecklistSupervisiItem,
  TindakLanjutItem,
  StatusSupervisi,
  NilaiChecklist,
} from "@/types/supervisi";
import { DEFAULT_CHECKLIST_SUPERVISI } from "@/types/supervisi";

// ─── Daftar Bagian (Sections) Sesuai Urutan ──────────────────────────────────
const SECTIONS = [
  { id: "A", letter: "A", label: "Identitas", sub: "Data dasar supervisi", icon: Shield },
  { id: "B", letter: "B", label: "Checklist", sub: "5 aspek penilaian", icon: ClipboardCheck },
  { id: "C", letter: "C", label: "Hasil Supervisi", sub: "Persentase kepatuhan", icon: BarChart3 },
  { id: "D", letter: "D", label: "Temuan", sub: "Ketidaksesuaian", icon: Search },
  { id: "E", letter: "E", label: "Tindak Lanjut", sub: "Rencana perbaikan", icon: FileText },
  { id: "F", letter: "F", label: "Kesimpulan", sub: "Rekomendasi", icon: TrendingUp },
  { id: "TTD", letter: "✎", label: "Tanda Tangan", sub: "Pengesahan", icon: PenLine },
];

function SectionCard({
  id,
  letter,
  label,
  children,
}: {
  id: string;
  letter: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`sec-${id}`}
      className="rounded-2xl border border-border bg-card shadow-xs mb-6 overflow-hidden scroll-mt-6"
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/20">
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
  id: string;
  value: string;
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

function TextareaField({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
    />
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function calcHasil(checklist: ChecklistSupervisiItem[]) {
  const dinilai = checklist.filter((c) => c.nilai !== "na" && c.nilai !== null);
  const ya = dinilai.filter((c) => c.nilai === "ya").length;
  const tidak = dinilai.filter((c) => c.nilai === "tidak").length;
  const pct = dinilai.length > 0 ? (ya / dinilai.length) * 100 : 0;
  let kategori: SupervisiBulanan["hasil_kategori"] = "perlu_perbaikan";
  if (pct >= 80) kategori = "baik";
  else if (pct >= 60) kategori = "cukup";
  return {
    jumlah_item_dinilai: dinilai.length,
    jumlah_ya: ya,
    jumlah_tidak: tidak,
    persentase_kepatuhan: Math.round(pct * 100) / 100,
    hasil_kategori: kategori,
  };
}

function hasilColor(k: string) {
  if (k === "baik") return "text-emerald-600";
  if (k === "cukup") return "text-amber-600";
  return "text-red-600";
}

function hasilBg(k: string) {
  if (k === "baik")
    return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/60";
  if (k === "cukup")
    return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/60";
  return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/60";
}

function hasilLabel(k: string) {
  if (k === "baik") return "Baik";
  if (k === "cukup") return "Cukup";
  return "Perlu Perbaikan";
}

// ─── Default State ───────────────────────────────────────────────────────────
function defaultForm(): Partial<SupervisiBulanan> {
  return {
    nama_rs: "UPTD Khusus RSUD dr. M. Yunus Bengkulu",
    unit_ruang: "",
    bulan_periode: "",
    tanggal_supervisi: new Date().toISOString().split("T")[0],
    supervisor: "",
    checklist_supervisi: DEFAULT_CHECKLIST_SUPERVISI.map((c) => ({ ...c })),
    jumlah_item_dinilai: 0,
    jumlah_ya: 0,
    jumlah_tidak: 0,
    persentase_kepatuhan: 0,
    hasil_kategori: "perlu_perbaikan",
    temuan_ketidaksesuaian: "",
    hal_sudah_baik: "",
    tindak_lanjut: [],
    kesimpulan: "sesuai",
    rekomendasi_supervisor: "",
    supervisor_nama: "",
    supervisor_nip: "",
    supervisor_ttd_url: "",
    pj_unit_nama: "",
    pj_unit_nip: "",
    pj_unit_ttd_url: "",
    status: "draft",
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface SupervisiFormProps {
  mode: "create" | "edit";
  initialData?: SupervisiBulanan;
}

export default function SupervisiForm({ mode, initialData }: SupervisiFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<SupervisiBulanan>>(
    initialData ? { ...initialData } : defaultForm()
  );

  const [activeSection, setActiveSection] = useState("A");
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const set = useCallback(<K extends keyof SupervisiBulanan>(key: K, val: SupervisiBulanan[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  // Re-calc hasil when checklist changes
  const checklist = (form.checklist_supervisi ?? []) as ChecklistSupervisiItem[];
  const hasil = calcHasil(checklist);

  useEffect(() => {
    setForm((prev) => ({ ...prev, ...hasil }));
  }, [JSON.stringify(checklist)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll spy tracking for active section in strict sequential order
  const sectionIds = useMemo(() => ["A", "B", "C", "D", "E", "F", "TTD"], []);

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
  const handleSave = async (status: StatusSupervisi) => {
    setSaving(true);
    const payload = { ...form, status };

    try {
      if (mode === "create") {
        const { data, error } = await supervisiService.create(payload);
        if (error || !data) throw new Error(error ?? "Gagal menyimpan");
        router.push(`/supervisi/${data.id}`);
      } else {
        const { error } = await supervisiService.update(initialData!.id, payload);
        if (error) throw new Error(error);
        router.push(`/supervisi/${initialData!.id}`);
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  // Checklist toggle
  const setChecklistNilai = (idx: number, nilai: NilaiChecklist) => {
    const next = checklist.map((item, i) =>
      i === idx ? { ...item, nilai: item.nilai === nilai ? null : nilai } : item
    );
    set("checklist_supervisi", next as any);
  };
  const setChecklistKeterangan = (idx: number, ket: string) => {
    const next = checklist.map((item, i) => (i === idx ? { ...item, keterangan: ket } : item));
    set("checklist_supervisi", next as any);
  };

  // Tindak lanjut
  const tindakLanjut = (form.tindak_lanjut ?? []) as TindakLanjutItem[];
  const addTL = () =>
    set(
      "tindak_lanjut",
      [
        ...tindakLanjut,
        { id: crypto.randomUUID(), masalah: "", tindak_lanjut: "", pic: "", target: "" },
      ] as any
    );
  const removeTL = (id: string) =>
    set("tindak_lanjut", tindakLanjut.filter((t) => t.id !== id) as any);
  const setTL = (id: string, field: keyof TindakLanjutItem, val: string) =>
    set(
      "tindak_lanjut",
      tindakLanjut.map((t) => (t.id === id ? { ...t, [field]: val } : t)) as any
    );

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden bg-background">
      {/* ── Top Bar Sesuai Template Penyuluhan ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/supervisi"
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
              {mode === "create" ? "Formulir Baru" : "Edit Formulir"}
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate hidden xs:block">
              Supervisi Bulanan PKRS
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
                  <span>{sec.letter === "✎" ? "TTD" : `${sec.letter}.`}</span>
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
              hasil={hasil}
              checklist={checklist}
              setChecklistNilai={setChecklistNilai}
              setChecklistKeterangan={setChecklistKeterangan}
              tindakLanjut={tindakLanjut}
              addTL={addTL}
              removeTL={removeTL}
              setTL={setTL}
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
  form: Partial<SupervisiBulanan>;
  set: <K extends keyof SupervisiBulanan>(key: K, val: SupervisiBulanan[K]) => void;
  hasil: ReturnType<typeof calcHasil>;
  checklist: ChecklistSupervisiItem[];
  setChecklistNilai: (idx: number, nilai: NilaiChecklist) => void;
  setChecklistKeterangan: (idx: number, ket: string) => void;
  tindakLanjut: TindakLanjutItem[];
  addTL: () => void;
  removeTL: (id: string) => void;
  setTL: (id: string, field: keyof TindakLanjutItem, val: string) => void;
  onSave: (status: StatusSupervisi) => void;
  saving: boolean;
}

function FormSections({
  form,
  set,
  hasil,
  checklist,
  setChecklistNilai,
  setChecklistKeterangan,
  tindakLanjut,
  addTL,
  removeTL,
  setTL,
  onSave,
  saving,
}: FormSectionsProps) {
  return (
    <>
      {/* Section A — Identitas Supervisi */}
      <SectionCard id="A" letter="A" label="Identitas Supervisi">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FieldLabel>Nama Rumah Sakit</FieldLabel>
            <InputField
              id="input-nama-rs"
              value={form.nama_rs ?? ""}
              onChange={(e) => set("nama_rs", e.target.value)}
              placeholder="Nama RS"
            />
          </div>
          <div>
            <FieldLabel required>Unit / Ruang</FieldLabel>
            <InputField
              id="input-unit-ruang"
              value={form.unit_ruang ?? ""}
              onChange={(e) => set("unit_ruang", e.target.value)}
              placeholder="contoh: Poli Jantung / Rawat Inap"
            />
          </div>
          <div>
            <FieldLabel required>Bulan / Periode</FieldLabel>
            <InputField
              id="input-bulan"
              value={form.bulan_periode ?? ""}
              onChange={(e) => set("bulan_periode", e.target.value)}
              placeholder="contoh: Agustus 2026"
            />
          </div>
          <div>
            <FieldLabel required>Tanggal Supervisi</FieldLabel>
            <InputField
              id="input-tgl"
              type="date"
              value={form.tanggal_supervisi ?? ""}
              onChange={(e) => set("tanggal_supervisi", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel required>Supervisor</FieldLabel>
            <InputField
              id="input-supervisor"
              value={form.supervisor ?? ""}
              onChange={(e) => set("supervisor", e.target.value)}
              placeholder="Nama lengkap supervisor"
            />
          </div>
        </div>
      </SectionCard>

      {/* Section B — Checklist Supervisi */}
      <SectionCard id="B" letter="B" label="Checklist Supervisi">
        <div className="space-y-4">
          {checklist.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.id}
                </span>
                <p className="text-sm text-foreground leading-relaxed flex-1 font-medium">
                  {item.label}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pl-9">
                {(["ya", "tidak", "na"] as NilaiChecklist[]).map((nilai) => (
                  <button
                    key={nilai}
                    type="button"
                    onClick={() => setChecklistNilai(idx, nilai)}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                      item.nilai === nilai
                        ? nilai === "ya"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : nilai === "tidak"
                          ? "bg-red-600 text-white border-red-600 shadow-2xs"
                          : "bg-slate-600 text-white border-slate-600 shadow-2xs"
                        : "bg-background border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {nilai === "ya" ? "Ya" : nilai === "tidak" ? "Tidak" : "N/A"}
                  </button>
                ))}
              </div>
              <div className="pl-9">
                <input
                  type="text"
                  placeholder="Keterangan (opsional)"
                  value={item.keterangan}
                  onChange={(e) => setChecklistKeterangan(idx, e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section C — Hasil Supervisi */}
      <SectionCard id="C" letter="C" label="Hasil Supervisi">
        <div className={cn("rounded-xl border p-4", hasilBg(hasil.hasil_kategori))}>
          <div className="flex items-center justify-between mb-3">
            <span className={cn("text-2xl font-bold", hasilColor(hasil.hasil_kategori))}>
              {hasil.persentase_kepatuhan.toFixed(1)}%
            </span>
            <span
              className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full",
                hasilColor(hasil.hasil_kategori),
                hasil.hasil_kategori === "baik"
                  ? "bg-emerald-100"
                  : hasil.hasil_kategori === "cukup"
                  ? "bg-amber-100"
                  : "bg-red-100"
              )}
            >
              {hasilLabel(hasil.hasil_kategori)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-border mb-3">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                hasil.hasil_kategori === "baik"
                  ? "bg-emerald-500"
                  : hasil.hasil_kategori === "cukup"
                  ? "bg-amber-500"
                  : "bg-red-500"
              )}
              style={{ width: `${Math.min(100, hasil.persentase_kepatuhan)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center p-2 rounded-lg bg-background/60">
              <div className="font-bold text-sm text-foreground">{hasil.jumlah_item_dinilai}</div>
              <div className="text-muted-foreground">Item Dinilai</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/60">
              <div className="font-bold text-sm text-emerald-600">{hasil.jumlah_ya}</div>
              <div className="text-muted-foreground">Ya</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/60">
              <div className="font-bold text-sm text-red-600">{hasil.jumlah_tidak}</div>
              <div className="text-muted-foreground">Tidak</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Nilai dihitung otomatis dari checklist. Item N/A tidak
          dihitung.
        </p>
      </SectionCard>

      {/* Section D — Temuan */}
      <SectionCard id="D" letter="D" label="Temuan">
        <div className="space-y-4">
          <div>
            <FieldLabel>Ketidaksesuaian / Temuan</FieldLabel>
            <TextareaField
              id="input-temuan"
              rows={4}
              value={form.temuan_ketidaksesuaian ?? ""}
              onChange={(e) => set("temuan_ketidaksesuaian", e.target.value)}
              placeholder="Tuliskan temuan dan ketidaksesuaian yang ditemukan..."
            />
          </div>
          <div>
            <FieldLabel>Hal yang Sudah Baik</FieldLabel>
            <TextareaField
              id="input-hal-baik"
              rows={3}
              value={form.hal_sudah_baik ?? ""}
              onChange={(e) => set("hal_sudah_baik", e.target.value)}
              placeholder="Tuliskan hal-hal yang sudah berjalan baik..."
            />
          </div>
        </div>
      </SectionCard>

      {/* Section E — Tindak Lanjut */}
      <SectionCard id="E" letter="E" label="Tindak Lanjut">
        <div className="space-y-3">
          {tindakLanjut.map((tl, idx) => (
            <div key={tl.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Tindak Lanjut #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeTL(tl.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Masalah</label>
                  <input
                    value={tl.masalah}
                    onChange={(e) => setTL(tl.id, "masalah", e.target.value)}
                    placeholder="Uraikan masalah..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Tindak Lanjut</label>
                  <input
                    value={tl.tindak_lanjut}
                    onChange={(e) => setTL(tl.id, "tindak_lanjut", e.target.value)}
                    placeholder="Rencana tindak lanjut..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">PIC</label>
                  <input
                    value={tl.pic}
                    onChange={(e) => setTL(tl.id, "pic", e.target.value)}
                    placeholder="Penanggung jawab"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Target Waktu</label>
                  <input
                    value={tl.target}
                    onChange={(e) => setTL(tl.id, "target", e.target.value)}
                    placeholder="contoh: 30 Sept 2026"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addTL}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Baris Tindak Lanjut
          </button>
        </div>
      </SectionCard>

      {/* Section F — Kesimpulan */}
      <SectionCard id="F" letter="F" label="Kesimpulan & Rekomendasi">
        <div className="space-y-4">
          <div>
            <FieldLabel>Kesimpulan</FieldLabel>
            <div className="flex gap-3">
              {(["sesuai", "perlu_perbaikan"] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set("kesimpulan", val)}
                  className={cn(
                    "flex-1 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer",
                    form.kesimpulan === val
                      ? val === "sesuai"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-amber-500 text-white border-amber-500"
                      : "bg-background border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {val === "sesuai" ? "Sesuai" : "Perlu Perbaikan"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Rekomendasi Supervisor</FieldLabel>
            <TextareaField
              id="input-rekomendasi"
              rows={4}
              value={form.rekomendasi_supervisor ?? ""}
              onChange={(e) => set("rekomendasi_supervisor", e.target.value)}
              placeholder="Tuliskan rekomendasi atau catatan supervisor..."
            />
          </div>
        </div>
      </SectionCard>

      {/* Section TTD — Tanda Tangan & Pengesahan */}
      <SectionCard id="TTD" letter="✎" label="Tanda Tangan & Pengesahan">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Supervisor</h3>
            <div className="space-y-3">
              <div>
                <FieldLabel>Nama</FieldLabel>
                <InputField
                  id="input-supervisor-nama"
                  value={form.supervisor_nama ?? ""}
                  onChange={(e) => set("supervisor_nama", e.target.value)}
                  placeholder="Nama lengkap supervisor"
                />
              </div>
              <div>
                <FieldLabel>NIP</FieldLabel>
                <InputField
                  id="input-supervisor-nip"
                  value={form.supervisor_nip ?? ""}
                  onChange={(e) => set("supervisor_nip", e.target.value)}
                  placeholder="Nomor Induk Pegawai"
                />
              </div>
              <div>
                <FieldLabel>Tanda Tangan</FieldLabel>
                <SignaturePad
                  id="ttd-supervisor"
                  label="Supervisor"
                  value={form.supervisor_ttd_url || undefined}
                  onChange={(v) => set("supervisor_ttd_url", v ?? "")}
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">PJ Unit / Ruang</h3>
            <div className="space-y-3">
              <div>
                <FieldLabel>Nama</FieldLabel>
                <InputField
                  id="input-pj-nama"
                  value={form.pj_unit_nama ?? ""}
                  onChange={(e) => set("pj_unit_nama", e.target.value)}
                  placeholder="Nama PJ unit/ruang"
                />
              </div>
              <div>
                <FieldLabel>NIP</FieldLabel>
                <InputField
                  id="input-pj-nip"
                  value={form.pj_unit_nip ?? ""}
                  onChange={(e) => set("pj_unit_nip", e.target.value)}
                  placeholder="Nomor Induk Pegawai"
                />
              </div>
              <div>
                <FieldLabel>Tanda Tangan</FieldLabel>
                <SignaturePad
                  id="ttd-pj-unit"
                  label="PJ Unit"
                  value={form.pj_unit_ttd_url || undefined}
                  onChange={(v) => set("pj_unit_ttd_url", v ?? "")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom action buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            id="btn-draft-bottom"
            className="rounded-xl gap-2 w-full sm:w-auto cursor-pointer"
            onClick={() => onSave("draft")}
            disabled={saving}
          >
            <Save className="w-4 h-4" /> Simpan Draft
          </Button>
          <Button
            id="btn-selesai-bottom"
            className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto cursor-pointer"
            onClick={() => onSave("selesai")}
            disabled={saving}
          >
            <CheckCircle className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan & Selesai"}
          </Button>
        </div>
      </SectionCard>
    </>
  );
}
