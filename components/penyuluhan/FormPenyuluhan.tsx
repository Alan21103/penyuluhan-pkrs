"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { penyuluhanService } from "@/services/penyuluhan.service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle, ChevronLeft, Loader2 } from "lucide-react";
import { type UploadedDocItem } from "./UploadDokumen";
import {
  type FormData,
  DEFAULT_FORM,
  NAV_SECTIONS,
} from "./form/FormShared";
import SectionIdentitas from "./form/SectionIdentitas";
import SectionTujuanMateri from "./form/SectionTujuanMateri";
import SectionChecklist from "./form/SectionChecklist";
import SectionEvaluasiDokumentasi from "./form/SectionEvaluasiDokumentasi";
import SectionPengesahan from "./form/SectionPengesahan";

export interface FormPenyuluhanProps {
  mode: "create" | "edit";
  userId: string;
  initialData?: Partial<FormData> & { id?: string; status?: string };
}

export default function FormPenyuluhan({ mode, userId, initialData }: FormPenyuluhanProps) {
  const router = useRouter();

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
      metode: (initialData.metode as any) ?? [],
      media: (initialData.media as any) ?? [],
      media_lainnya: initialData.media_lainnya ?? "",
      tujuan_penyuluhan: (initialData.tujuan_penyuluhan as string[]) ?? [""],
      materi_disampaikan: (initialData.materi_disampaikan as string[]) ?? [""],
      checklist_evaluasi: (initialData.checklist_evaluasi as any) ?? DEFAULT_FORM.checklist_evaluasi,
      jumlah_peserta_e: initialData.jumlah_peserta_e ?? 0,
      jumlah_paham: initialData.jumlah_paham ?? 0,
      metode_verifikasi: (initialData.metode_verifikasi as any) ?? [],
      hal_baik: initialData.hal_baik ?? "",
      kendala: initialData.kendala ?? "",
      rencana_tindak_lanjut: initialData.rencana_tindak_lanjut ?? "",
      dokumen_checklist: (initialData.dokumen_checklist as any) ?? [],
      pj_pkrs_nama: initialData.pj_pkrs_nama ?? "",
      pj_pkrs_nip: initialData.pj_pkrs_nip ?? "",
      pj_pkrs_ttd_url: (initialData as any).pj_pkrs_ttd_url ?? "",
      penyuluh_nama: initialData.penyuluh_nama ?? "",
      penyuluh_nip: initialData.penyuluh_nip ?? "",
      penyuluh_ttd_url: (initialData as any).penyuluh_ttd_url ?? "",
    } : {}),
  });

  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState<string>("");
  const [stagedFiles, setStagedFiles] = useState<UploadedDocItem[]>([]);
  const [activeSection, setActiveSection] = useState("A");
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll spy tracking for active section
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
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

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

  const handleSave = async (status: "draft" | "selesai") => {
    setSaving(true);
    setSavingStatus("Menyimpan data kegiatan...");
    const cleanArr = (arr: string[]) => arr.filter((s) => s.trim() !== "");

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

    if (mode === "create") {
      payload.created_by = userId;
    }

    let error: string | null = null;
    if (mode === "edit" && initialData?.id) {
      const res = await penyuluhanService.update(initialData.id, payload as any);
      error = res.error;
    } else {
      const res = await penyuluhanService.create(payload as any);
      error = res.error;

      // Jika kegiatan baru berhasil dibuat dan ada berkas dokumentasi yang di-stage
      if (!error && res.data && stagedFiles.length > 0) {
        setSavingStatus(`Mengunggah ${stagedFiles.length} berkas dokumentasi...`);
        const uploadRes = await penyuluhanService.uploadDokumenBatch(
          res.data.id,
          userId,
          stagedFiles
        );
        if (!uploadRes.success) {
          console.warn("Peringatan upload sebagian berkas:", uploadRes.errors);
        }
      }
    }

    setSaving(false);
    setSavingStatus("");
    if (!error) {
      router.push("/penyuluhan");
      router.refresh();
    } else {
      console.error("Save error:", error);
      alert("Gagal menyimpan: " + error);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden bg-background">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/penyuluhan"
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
              {mode === "create" ? "Formulir Baru" : "Edit Formulir"}
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate hidden xs:block">
              Promosi Kesehatan Rumah Sakit (PKRS)
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
                <span>{savingStatus || "Menyimpan..."}</span>
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
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col border-r border-border bg-muted/10 p-4 shrink-0 overflow-y-auto">
          <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase px-3 mb-2">
            Daftar Bagian
          </p>
          <nav className="space-y-1">
            {NAV_SECTIONS.map((sec) => {
              const Icon = sec.icon;
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
                    {sec.id === "EFG" ? "E–G" : sec.id === "TTD" ? "✎" : sec.id}
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

        {/* Mobile / Tablet: Nav Tabs + Form Content — stacked vertically */}
        <div className="lg:hidden flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Mobile Horizontal Navigation Tabs */}
          <div className="flex overflow-x-auto gap-1.5 p-2 border-b border-border bg-muted/20 shrink-0">
            {NAV_SECTIONS.map((sec) => {
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
                  <span>{sec.id === "EFG" ? "E-G" : sec.id === "TTD" ? "TTD" : sec.id}.</span>
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Form Content Area (mobile) */}
          <div ref={contentRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
            {/* Section A — Identitas Kegiatan */}
            <SectionIdentitas
              form={form}
              set={set}
              addItem={addItem}
              updateItem={updateItem}
              removeItem={removeItem}
              initialSasaran={initialData?.sasaran}
            />

            {/* Section B & C — Tujuan & Materi */}
            <SectionTujuanMateri
              form={form}
              addItem={addItem}
              updateItem={updateItem}
              removeItem={removeItem}
            />

            {/* Section D — Pelaksanaan Checklist */}
            <SectionChecklist
              form={form}
              set={set}
            />

            {/* Section E, F, G — Evaluasi & Dokumentasi */}
            <SectionEvaluasiDokumentasi
              form={form}
              set={set}
              mode={mode}
              userId={userId}
              penyuluhanId={initialData?.id}
              stagedFiles={stagedFiles}
              onStagedFilesChange={setStagedFiles}
            />

            {/* Section TTD — Pengesahan & Tanda Tangan */}
            <SectionPengesahan
              form={form}
              set={set}
              saving={saving}
              onSave={handleSave}
            />
          </div>
        </div>

        {/* Desktop: Scrollable Form Content Area */}
        <div ref={contentRef} className="hidden lg:block flex-1 overflow-y-auto px-6 py-6 pb-12">
          {/* Section A — Identitas Kegiatan */}
          <SectionIdentitas
            form={form}
            set={set}
            addItem={addItem}
            updateItem={updateItem}
            removeItem={removeItem}
            initialSasaran={initialData?.sasaran}
          />

          {/* Section B & C — Tujuan & Materi */}
          <SectionTujuanMateri
            form={form}
            addItem={addItem}
            updateItem={updateItem}
            removeItem={removeItem}
          />

          {/* Section D — Pelaksanaan Checklist */}
          <SectionChecklist
            form={form}
            set={set}
          />

          {/* Section E, F, G — Evaluasi & Dokumentasi */}
          <SectionEvaluasiDokumentasi
            form={form}
            set={set}
            mode={mode}
            userId={userId}
            penyuluhanId={initialData?.id}
            stagedFiles={stagedFiles}
            onStagedFilesChange={setStagedFiles}
          />

          {/* Section TTD — Pengesahan & Tanda Tangan */}
          <SectionPengesahan
            form={form}
            set={set}
            saving={saving}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
