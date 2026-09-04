"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Pencil,
  Download,
  ChevronLeft,
  Check,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadSupervisiPDF } from "@/services/export/supervisi-pdf";
import type { SupervisiBulanan } from "@/types/supervisi";

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

const hasilBg = (k: string) => {
  if (k === "baik") return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20";
  if (k === "cukup") return "bg-amber-50 border-amber-200 dark:bg-amber-950/20";
  return "bg-red-50 border-red-200 dark:bg-red-950/20";
};

const hasilColor = (k: string) => {
  if (k === "baik") return "text-emerald-700 dark:text-emerald-300";
  if (k === "cukup") return "text-amber-700 dark:text-amber-300";
  return "text-red-700 dark:text-red-300";
};

const hasilLabel = (k: string) =>
  ({ baik: "Baik", cukup: "Cukup", perlu_perbaikan: "Perlu Perbaikan" }[k] ?? k);

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="text-xs text-foreground font-medium flex-1">{String(value ?? "-")}</span>
    </div>
  );
}

function SectionBox({
  letter,
  title,
  children,
}: {
  letter: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/20">
        <span className="w-6 h-6 rounded-md bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
          {letter}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

interface SupervisiDetailProps {
  data: SupervisiBulanan;
}

export default function SupervisiDetail({ data }: SupervisiDetailProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Nav Sesuai Template Penyuluhan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <Link
          href="/supervisi"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/supervisi/${data.id}/edit`}>
            <Button variant="outline" className="gap-2 rounded-xl text-xs sm:text-sm" id="btn-edit-supervisi">
              <Pencil className="w-4 h-4" /> Edit
            </Button>
          </Link>
          <Button
            onClick={() => downloadSupervisiPDF(data)}
            className="gap-2 rounded-xl bg-primary text-xs sm:text-sm cursor-pointer"
            id="btn-export-pdf-supervisi"
          >
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Grid Layout (2/3 konten, 1/3 sidebar info) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Konten Detail — 2/3 lebar */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-5">
          {/* Header Card */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-lg font-bold text-foreground">{data.unit_ruang || "Unit Supervisi"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Periode: {data.bulan_periode || "-"} • {data.nama_rs || "RSUD dr. M. Yunus"}
            </p>
          </div>

          {/* Section A — Identitas Supervisi */}
          <SectionBox letter="A" title="Identitas Supervisi">
            <InfoRow label="Nama Rumah Sakit" value={data.nama_rs} />
            <InfoRow label="Unit / Ruang" value={data.unit_ruang} />
            <InfoRow label="Bulan / Periode" value={data.bulan_periode} />
            <InfoRow label="Tanggal Supervisi" value={fmtDate(data.tanggal_supervisi)} />
            <InfoRow label="Supervisor" value={data.supervisor} />
          </SectionBox>

          {/* Section B — Checklist Supervisi */}
          <SectionBox letter="B" title="Checklist Supervisi">
            <div className="divide-y divide-border/60">
              {(data.checklist_supervisi ?? []).map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-lg text-xs font-bold shrink-0 mt-0.5",
                      item.nilai === "ya"
                        ? "bg-emerald-600 text-white"
                        : item.nilai === "tidak"
                        ? "bg-rose-600 text-white"
                        : "bg-slate-500 text-white"
                    )}
                  >
                    {item.nilai === "ya" ? "Ya" : item.nilai === "tidak" ? "Tidak" : item.nilai === "na" ? "N/A" : "—"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground">{item.label}</p>
                    {item.keterangan && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Catatan: {item.keterangan}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionBox>

          {/* Section C — Hasil Supervisi */}
          <SectionBox letter="C" title="Hasil Supervisi">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-muted/40 text-center">
                <span className="text-xs text-muted-foreground block">Item Dinilai</span>
                <span className="text-base font-bold text-foreground">{data.jumlah_item_dinilai}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-center">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 block">Jumlah Sesuai (Ya)</span>
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">{data.jumlah_ya}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-center">
                <span className="text-xs text-rose-700 dark:text-rose-300 block">Tidak Sesuai</span>
                <span className="text-base font-bold text-rose-700 dark:text-rose-300">{data.jumlah_tidak}</span>
              </div>
            </div>
            <InfoRow label="Kepatuhan" value={`${(data.persentase_kepatuhan ?? 0).toFixed(1)}%`} />
            <InfoRow label="Kategori Hasil" value={hasilLabel(data.hasil_kategori)} />
          </SectionBox>

          {/* Section D — Temuan */}
          <SectionBox letter="D" title="Temuan">
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Ketidaksesuaian / Temuan
                </p>
                <p className="text-foreground whitespace-pre-wrap bg-muted/20 p-3 rounded-xl border border-border">
                  {data.temuan_ketidaksesuaian || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Hal yang Sudah Baik
                </p>
                <p className="text-foreground whitespace-pre-wrap bg-muted/20 p-3 rounded-xl border border-border">
                  {data.hal_sudah_baik || "-"}
                </p>
              </div>
            </div>
          </SectionBox>

          {/* Section E — Tindak Lanjut */}
          <SectionBox letter="E" title="Rencana Tindak Lanjut">
            {(data.tindak_lanjut ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Tidak ada catatan tindak lanjut.</p>
            ) : (
              <div className="space-y-3">
                {data.tindak_lanjut.map((tl, i) => (
                  <div key={tl.id ?? i} className="rounded-xl border border-border p-3.5 bg-muted/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-border/50 pb-1.5 font-semibold text-muted-foreground">
                      <span>Tindak Lanjut #{i + 1}</span>
                      <span>Target: {tl.target || "-"}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Masalah</span>
                        <span className="font-medium text-foreground">{tl.masalah || "-"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">PIC (Penanggung Jawab)</span>
                        <span className="font-medium text-foreground">{tl.pic || "-"}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground block text-[11px]">Rencana Tindak Lanjut</span>
                        <span className="font-medium text-foreground">{tl.tindak_lanjut || "-"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionBox>

          {/* Section F — Kesimpulan & Rekomendasi */}
          <SectionBox letter="F" title="Kesimpulan & Rekomendasi">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-40 shrink-0">Kesimpulan:</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    data.kesimpulan === "sesuai"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  )}
                >
                  {data.kesimpulan === "sesuai" ? "✓ Sesuai" : "⚠ Perlu Perbaikan"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Rekomendasi Supervisor:</span>
                <p className="text-xs sm:text-sm text-foreground bg-muted/20 p-3 rounded-xl border border-border whitespace-pre-wrap">
                  {data.rekomendasi_supervisor || "-"}
                </p>
              </div>
            </div>
          </SectionBox>

          {/* Section G / ✎ — Tanda Tangan */}
          <SectionBox letter="✎" title="Tanda Tangan & Pengesahan">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Supervisor</p>
                <InfoRow label="Nama" value={data.supervisor_nama} />
                <InfoRow label="NIP" value={data.supervisor_nip} />
                {data.supervisor_ttd_url ? (
                  <div className="mt-2 border border-border rounded-xl overflow-hidden h-24 flex items-center justify-center bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.supervisor_ttd_url}
                      alt="TTD Supervisor"
                      className="max-h-20 max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="mt-2 border border-dashed border-border rounded-xl h-24 flex items-center justify-center text-xs text-muted-foreground bg-muted/10">
                    Belum ditandatangani
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground mb-1">PJ Unit / Ruang</p>
                <InfoRow label="Nama" value={data.pj_unit_nama} />
                <InfoRow label="NIP" value={data.pj_unit_nip} />
                {data.pj_unit_ttd_url ? (
                  <div className="mt-2 border border-border rounded-xl overflow-hidden h-24 flex items-center justify-center bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.pj_unit_ttd_url}
                      alt="TTD PJ Unit"
                      className="max-h-20 max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="mt-2 border border-dashed border-border rounded-xl h-24 flex items-center justify-center text-xs text-muted-foreground bg-muted/10">
                    Belum ditandatangani
                  </div>
                )}
              </div>
            </div>
          </SectionBox>
        </div>

        {/* Sidebar Kanan — Status + Skor Kepatuhan + Riwayat (Template Penyuluhan) */}
        <div className="space-y-4">
          {/* Status Box */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Status Formulir</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status Dokumen</span>
              {data.status === "selesai" ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-semibold border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> Draft
                </span>
              )}
            </div>
          </div>

          {/* Persentase Kepatuhan Card */}
          <div className={cn("rounded-2xl border p-5 space-y-3", hasilBg(data.hasil_kategori))}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Tingkat Kepatuhan</span>
              <span
                className={cn(
                  "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/70 shadow-2xs",
                  hasilColor(data.hasil_kategori)
                )}
              >
                {hasilLabel(data.hasil_kategori)}
              </span>
            </div>
            <div
              className="text-3xl font-extrabold"
              style={{
                color:
                  data.hasil_kategori === "baik"
                    ? "#059669"
                    : data.hasil_kategori === "cukup"
                    ? "#d97706"
                    : "#dc2626",
              }}
            >
              {(data.persentase_kepatuhan ?? 0).toFixed(1)}%
            </div>
            <div className="w-full h-2 rounded-full bg-white/60 overflow-hidden">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  data.hasil_kategori === "baik"
                    ? "bg-emerald-500"
                    : data.hasil_kategori === "cukup"
                    ? "bg-amber-500"
                    : "bg-red-500"
                )}
                style={{ width: `${Math.min(100, data.persentase_kepatuhan ?? 0)}%` }}
              />
            </div>
          </div>

          {/* Riwayat Card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-foreground">Riwayat Supervisi</h3>
            <div className="space-y-3 pt-1">
              <div className="flex gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Dibuat</p>
                  <p className="text-muted-foreground">{fmtDate(data.created_at)}</p>
                </div>
              </div>
              {data.updated_at !== data.created_at && (
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Terakhir Diperbarui</p>
                    <p className="text-muted-foreground">{fmtDate(data.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
