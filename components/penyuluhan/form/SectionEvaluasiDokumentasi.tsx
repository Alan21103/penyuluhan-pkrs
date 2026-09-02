"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import UploadDokumen, { type UploadedDocItem } from "@/components/penyuluhan/UploadDokumen";
import {
  FormData,
  SectionCard,
  FieldLabel,
  InputField,
  TextareaField,
  MultiCheckbox,
  METODE_VERIFIKASI_OPTIONS,
  JENIS_DOKUMEN_OPTIONS,
} from "./FormShared";

interface SectionEvaluasiDokumentasiProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
  mode: "create" | "edit";
  userId: string;
  penyuluhanId?: string;
  stagedFiles?: UploadedDocItem[];
  onStagedFilesChange?: (files: UploadedDocItem[]) => void;
}

export default function SectionEvaluasiDokumentasi({
  form,
  set,
  mode,
  userId,
  penyuluhanId,
  stagedFiles,
  onStagedFilesChange,
}: SectionEvaluasiDokumentasiProps) {
  const pctPemahaman =
    form.jumlah_peserta_e > 0
      ? Math.round((form.jumlah_paham / form.jumlah_peserta_e) * 100)
      : 0;

  return (
    <SectionCard id="EFG" label="Evaluasi & Dokumentasi" icon={BarChart3}>
      {/* ══ E — Verifikasi Pemahaman ══ */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="inline-flex w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold items-center justify-center">
            E
          </span>
          Hasil Verifikasi Pemahaman
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <FieldLabel>Jumlah Peserta</FieldLabel>
            <InputField
              id="input-jml-peserta-e"
              type="number"
              min={0}
              value={form.jumlah_peserta_e || ""}
              onChange={(e) => set("jumlah_peserta_e", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </div>
          <div>
            <FieldLabel>Jumlah Paham</FieldLabel>
            <InputField
              id="input-jml-paham"
              type="number"
              min={0}
              value={form.jumlah_paham || ""}
              onChange={(e) => set("jumlah_paham", e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </div>
          <div>
            <FieldLabel>Persentase Pemahaman</FieldLabel>
            <div
              className={cn(
                "h-10 px-3 rounded-xl border flex items-center justify-between text-sm font-semibold",
                pctPemahaman >= 70
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              )}
            >
              <span>{pctPemahaman}%</span>
              <span className="text-xs font-normal">
                {pctPemahaman >= 70 ? "Baik ✓" : "Perlu Perhatian"}
              </span>
            </div>
          </div>
        </div>
        <div>
          <FieldLabel>Metode Verifikasi</FieldLabel>
          <MultiCheckbox
            id="metode-verifikasi"
            options={METODE_VERIFIKASI_OPTIONS}
            value={form.metode_verifikasi}
            onChange={(v) => set("metode_verifikasi", v)}
          />
        </div>
      </div>

      {/* ══ F — Hasil Evaluasi ══ */}
      <div className="border-t border-border/60 pt-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="inline-flex w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold items-center justify-center">
            F
          </span>
          Hasil Evaluasi
        </h3>
        <div className="space-y-4">
          <div>
            <FieldLabel>Hal yang Sudah Baik</FieldLabel>
            <TextareaField
              id="input-hal-baik"
              rows={3}
              placeholder="Uraikan hal-hal yang sudah berjalan dengan baik..."
              value={form.hal_baik}
              onChange={(e) => set("hal_baik", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Kendala</FieldLabel>
            <TextareaField
              id="input-kendala"
              rows={3}
              placeholder="Uraikan kendala yang dihadapi..."
              value={form.kendala}
              onChange={(e) => set("kendala", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Rencana Tindak Lanjut</FieldLabel>
            <TextareaField
              id="input-rtl"
              rows={3}
              placeholder="Uraikan rencana tindak lanjut..."
              value={form.rencana_tindak_lanjut}
              onChange={(e) => set("rencana_tindak_lanjut", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ══ G — Dokumentasi ══ */}
      <div className="border-t border-border/60 pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="inline-flex w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold items-center justify-center">
            G
          </span>
          Dokumentasi
        </h3>
        <FieldLabel>Jenis Dokumen yang Tersedia</FieldLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          {JENIS_DOKUMEN_OPTIONS.map((jenis) => (
            <button
              key={jenis}
              type="button"
              id={`dok-${jenis}`}
              onClick={() => {
                const cur = form.dokumen_checklist;
                set(
                  "dokumen_checklist",
                  cur.includes(jenis) ? cur.filter((x) => x !== jenis) : [...cur, jenis]
                );
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-sm font-medium border transition-all cursor-pointer",
                form.dokumen_checklist.includes(jenis)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
              )}
            >
              {jenis}
            </button>
          ))}
        </div>

        {/* Formulir Upload Berkas & Tautan Dokumentasi Langsung */}
        <UploadDokumen
          penyuluhanId={penyuluhanId}
          userId={userId}
          mode={mode}
          dokumenChecklist={form.dokumen_checklist}
          stagedFiles={stagedFiles}
          onStagedFilesChange={onStagedFilesChange}
        />
      </div>
    </SectionCard>
  );
}
