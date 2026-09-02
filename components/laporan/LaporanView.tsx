"use client";

import { useState, useMemo } from "react";
import { generateExcel } from "@/services/export";
import { laporanService } from "@/services/laporan.service";
import { cn } from "@/lib/utils";
import { FileSpreadsheet, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/DatePicker";
import type { Penyuluhan } from "@/types/penyuluhan";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const STATUS_CONFIG = {
  draft: { label: "Draft", className: "bg-amber-50 text-amber-700 border-amber-200" },
  selesai: { label: "Selesai", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const PAGE_SIZE = 15;

interface LaporanViewProps {
  data: Penyuluhan[];
}

export default function LaporanView({ data }: LaporanViewProps) {
  const now = new Date();
  const [filterMode, setFilterMode] = useState<"range" | "bulan">("bulan");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [bulan, setBulan] = useState(now.getMonth()); // 0-indexed
  const [tahun, setTahun] = useState(now.getFullYear());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return laporanService.filterData(data, {
      filterMode,
      bulan,
      tahun,
      fromDate,
      toDate,
    });
  }, [data, filterMode, bulan, tahun, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    return laporanService.calculateStats(filtered);
  }, [filtered]);

  const totalPeserta = stats.totalPeserta;
  const avgPemahaman = stats.avgPemahaman;

  const handleExcel = () => {
    const label =
      filterMode === "bulan"
        ? `${MONTHS[bulan]}_${tahun}`
        : `${fromDate || "awal"}_sd_${toDate || "akhir"}`;
    generateExcel(filtered, `Rekap_PKRS_${label}.xlsx`);
  };

  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

  const pct = (paham: number, total: number) =>
    total > 0 ? `${Math.round((paham / total) * 100)}%` : "-";

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Laporan Rekap Penyuluhan</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">UPTD KHUSUS RSUD Dr. M. Yunus Bengkulu</p>
        </div>
        <Button
          id="btn-export-excel"
          onClick={handleExcel}
          disabled={filtered.length === 0}
          className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Excel ({filtered.length} data)
        </Button>
      </div>

      {/* ── Filter Card ── */}
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filter Data</h3>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          {(["bulan", "range"] as const).map((m) => (
            <button
              key={m}
              id={`filter-mode-${m}`}
              onClick={() => { setFilterMode(m); setPage(1); }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer",
                filterMode === m
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:border-primary/40"
              )}
            >
              {m === "bulan" ? "Per Bulan" : "Rentang Tanggal"}
            </button>
          ))}
        </div>

        {filterMode === "bulan" ? (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 sm:max-w-xs">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Bulan</label>
              <select
                id="filter-bulan"
                value={bulan}
                onChange={e => { setBulan(Number(e.target.value)); setPage(1); }}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-36">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tahun</label>
              <select
                id="filter-tahun"
                value={tahun}
                onChange={e => { setTahun(Number(e.target.value)); setPage(1); }}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="w-full sm:w-52">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Dari Tanggal</label>
              <DatePicker
                id="filter-from"
                value={fromDate}
                onChange={(val) => { setFromDate(val); setPage(1); }}
                placeholder="Pilih tanggal mulai"
                locale="id"
              />
            </div>
            <div className="w-full sm:w-52">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Sampai Tanggal</label>
              <DatePicker
                id="filter-to"
                value={toDate}
                onChange={(val) => { setToDate(val); setPage(1); }}
                placeholder="Pilih tanggal akhir"
                locale="id"
              />
            </div>
            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(""); setToDate(""); setPage(1); }}
                className="h-11 px-3.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-destructive flex items-center justify-center gap-1 transition-colors cursor-pointer w-full sm:w-auto"
              >
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Total Kegiatan", value: filtered.length, suffix: "kegiatan", color: "text-primary" },
          { label: "Total Peserta", value: totalPeserta.toLocaleString("id-ID"), suffix: "orang", color: "text-emerald-600" },
          { label: "Rata-rata Pemahaman", value: `${avgPemahaman.toFixed(1)}%`, suffix: "rata-rata", color: avgPemahaman >= 70 ? "text-emerald-600" : "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 shadow-xs">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-xl sm:text-2xl font-bold mt-1", s.color)}>{s.value}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground">{s.suffix}</p>
          </div>
        ))}
      </div>

      {/* ── Mobile Card View (< md) ── */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
            Tidak ada data untuk periode yang dipilih
          </div>
        ) : (
          paginated.map((d, i) => {
            const st = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.draft;
            return (
              <div key={d.id} className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">#{((page - 1) * PAGE_SIZE) + i + 1} · {fmtDate(d.hari_tanggal)}</span>
                  <span className={cn("text-xs px-2.5 py-0.5 rounded-full border font-medium", st.className)}>
                    {st.label}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{d.topik}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.sasaran}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
                  <div><span className="text-foreground/70 font-medium">Lokasi: </span>{d.tempat}</div>
                  <div><span className="text-foreground/70 font-medium">Peserta: </span>{d.jumlah_peserta} org</div>
                  <div className="col-span-2">
                    <span className="text-foreground/70 font-medium">Penyuluh: </span>
                    {(d.penyuluh ?? []).join(", ") || "-"}
                  </div>
                  <div className="col-span-2 flex items-center justify-between pt-1">
                    <span className="text-foreground/70 font-medium">Pemahaman:</span>
                    <span className={cn(
                      "font-bold text-xs px-2 py-0.5 rounded-md",
                      d.jumlah_peserta_e > 0 && (d.jumlah_paham / d.jumlah_peserta_e) >= 0.7
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/30"
                    )}>
                      {pct(d.jumlah_paham, d.jumlah_peserta_e)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 py-2">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop Table View (md+) ── */}
      <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["No", "Tanggal", "Topik", "Tempat", "Sasaran", "Peserta", "Penyuluh", "Metode", "% Paham", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-muted-foreground text-sm">
                    Tidak ada data untuk periode yang dipilih
                  </td>
                </tr>
              ) : (
                paginated.map((d, i) => {
                  const st = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.draft;
                  return (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtDate(d.hari_tanggal)}</td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="font-medium text-foreground truncate">{d.topik}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[130px] truncate text-foreground/80">{d.tempat}</td>
                      <td className="px-4 py-3 max-w-[120px] truncate text-foreground/80">{d.sasaran}</td>
                      <td className="px-4 py-3 text-foreground/80">{d.jumlah_peserta}</td>
                      <td className="px-4 py-3 max-w-[150px] truncate text-foreground/80">
                        {(d.penyuluh ?? []).join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3 max-w-[130px] truncate text-foreground/80 text-xs">
                        {(d.metode ?? []).join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "font-semibold",
                          d.jumlah_peserta_e > 0 && (d.jumlah_paham / d.jumlah_peserta_e) >= 0.7
                            ? "text-emerald-600"
                            : "text-amber-600"
                        )}>
                          {pct(d.jumlah_paham, d.jumlah_peserta_e)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", st.className)}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} data
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
