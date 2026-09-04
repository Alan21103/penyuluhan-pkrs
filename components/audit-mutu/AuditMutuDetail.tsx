"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Pencil, Download, ChevronLeft, Shield, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadAuditMutuPDF } from "@/services/export/audit-mutu-pdf";
import type { AuditMutu } from "@/types/audit-mutu";

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2.5 border-b border-border last:border-0">
      <dt className="text-sm font-medium text-muted-foreground col-span-1">{label}</dt>
      <dd className="text-sm text-foreground font-medium col-span-2">{value || "-"}</dd>
    </div>
  );
}

interface AuditMutuDetailProps {
  data: AuditMutu;
}

export default function AuditMutuDetail({ data }: AuditMutuDetailProps) {
  const checklist = data.checklist_audit ?? [];
  const totalCapaian = checklist.reduce((acc, c) => acc + (c.capaian || 0), 0);
  const avgCapaian = checklist.length > 0 ? Math.round((totalCapaian / checklist.length) * 10) / 10 : 0;
  const isGood = avgCapaian >= 80;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* ── Banner Header (Sesuai Desain Tema PKRS) ── */}
      <div className="bg-[#005ca9] text-white rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
            <Link
              href="/audit-mutu"
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>
            <span className="text-white/60">/</span>
            <Link href="/audit-mutu" className="hover:text-white transition-colors">
              Audit Mutu
            </Link>
            <span className="text-white/60">/</span>
            <span className="text-white font-medium">Detail Audit</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Detail Instrumen Indikator Mutu
          </h1>
          <p className="text-xs sm:text-sm text-white/80">
            {data.unit_ruangan || "Unit"} • {data.periode_audit || data.bulan || "PKRS RSUD dr. M. Yunus Bengkulu"}
          </p>
        </div>

        {/* Right side: Rata-Rata Capaian & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-xs rounded-2xl px-4 py-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold shrink-0">
              <Percent className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                RATA-RATA CAPAIAN
              </p>
              <p className="text-base sm:text-lg font-extrabold text-white leading-tight">
                {avgCapaian.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/audit-mutu/${data.id}/edit`}>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5 rounded-xl text-xs h-10 px-3 cursor-pointer"
                id="btn-edit-audit-detail"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
            </Link>
            <Button
              onClick={() => downloadAuditMutuPDF(data)}
              className="bg-white text-[#005ca9] hover:bg-white/90 font-semibold gap-1.5 rounded-xl text-xs h-10 px-3 cursor-pointer shadow-sm"
              id="btn-download-pdf-audit"
            >
              <Download className="w-3.5 h-3.5" /> Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Card: Summary */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">Detail Audit Indikator Mutu PKRS</h1>
            <p className="text-sm text-muted-foreground">
              {data.unit_ruangan} • {data.periode_audit || data.bulan}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {data.status === "selesai" ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800">
                <Clock className="w-3.5 h-3.5" /> Draft
              </span>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <dl>
              <DetailRow label="Unit / Ruangan" value={data.unit_ruangan} />
              <DetailRow label="Periode Audit" value={data.periode_audit} />
              <DetailRow label="Bulan" value={data.bulan} />
              <DetailRow label="Tanggal Audit" value={fmtDate(data.tanggal_audit)} />
              <DetailRow label="Auditor" value={data.auditor} />
            </dl>
          </div>

          {/* Average Box */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-muted/30 border border-border text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Rata-rata Capaian</p>
              <p className={cn("text-3xl font-extrabold mt-1", isGood ? "text-emerald-600" : "text-rose-600")}>
                {avgCapaian}%
              </p>
            </div>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                isGood
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
              )}
            >
              {isGood ? "Sesuai Standar (≥ 80%)" : "Belum Sesuai Standar"}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist 8 Indikator Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="font-semibold text-sm text-foreground">Hasil Evaluasi 8 Indikator Mutu</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-3 text-center w-10">No</th>
                <th className="py-3 px-4 text-left">Indikator Mutu</th>
                <th className="py-3 px-2 text-center w-24">Standar Target</th>
                <th className="py-3 px-2 text-center w-16">Ya</th>
                <th className="py-3 px-2 text-center w-16">Tidak</th>
                <th className="py-3 px-2 text-center w-20">Sampel</th>
                <th className="py-3 px-2 text-center w-20">Sesuai</th>
                <th className="py-3 px-3 text-center w-24">Capaian</th>
                <th className="py-3 px-4 text-left w-48">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {checklist.map((item, idx) => {
                const targetMet = item.capaian >= 80;
                return (
                  <tr key={item.id || idx} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-3 text-center text-muted-foreground font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 text-foreground font-medium leading-relaxed">
                      {item.indikator}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold text-[11px]">
                        {item.standar_target}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {item.ya ? (
                        <span className="font-bold text-emerald-600">✓</span>
                      ) : (
                        <span className="text-muted-foreground/30">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {item.tidak ? (
                        <span className="font-bold text-rose-600">✓</span>
                      ) : (
                        <span className="text-muted-foreground/30">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center text-foreground font-medium">
                      {item.jumlah_sampel ?? 0}
                    </td>
                    <td className="py-3 px-2 text-center text-foreground font-medium">
                      {item.jumlah_sesuai ?? 0}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1",
                          targetMet
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                        )}
                      >
                        {(item.capaian ?? 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.keterangan || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border">
          {checklist.map((item, idx) => (
            <div key={item.id || idx} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs text-foreground">
                  {idx + 1}. {item.indikator}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full font-bold text-[11px] shrink-0",
                    item.capaian >= 80
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                  )}
                >
                  {(item.capaian ?? 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Target: {item.standar_target}</span>
                <span>
                  Sampel: {item.jumlah_sampel} | Sesuai: {item.jumlah_sesuai}
                </span>
              </div>
              {item.keterangan && (
                <p className="text-xs text-muted-foreground italic bg-muted/20 p-2 rounded-lg">
                  Catatan: {item.keterangan}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
