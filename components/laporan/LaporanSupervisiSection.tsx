"use client";

import { useState, useMemo } from "react";
import { generateSupervisiExcel } from "@/services/export/supervisi-excel";
import { BULAN_LIST } from "@/constants/date";
import TablePagination from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import type { SupervisiBulanan } from "@/types/supervisi";

const PAGE_SIZE = 10;

interface LaporanSupervisiSectionProps {
  data: SupervisiBulanan[];
}

export default function LaporanSupervisiSection({ data }: LaporanSupervisiSectionProps) {
  const now = new Date();
  const [filterMode, setFilterMode] = useState<"semua" | "bulan">("bulan");
  const [bulan, setBulan] = useState(now.getMonth());
  const [tahun, setTahun] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (filterMode === "bulan") {
        if (!row.tanggal_supervisi) return false;
        const d = new Date(row.tanggal_supervisi);
        if (d.getMonth() !== bulan || d.getFullYear() !== tahun) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          row.unit_ruang?.toLowerCase().includes(q) ||
          row.supervisor?.toLowerCase().includes(q) ||
          row.bulan_periode?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [data, filterMode, bulan, tahun, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filtered.length;
    if (total === 0) {
      return { total: 0, avgKepatuhan: 0, baik: 0, cukup: 0, perluPerbaikan: 0 };
    }
    const sumKepatuhan = filtered.reduce((acc, curr) => acc + (curr.persentase_kepatuhan ?? 0), 0);
    const baik = filtered.filter((r) => r.hasil_kategori === "baik").length;
    const cukup = filtered.filter((r) => r.hasil_kategori === "cukup").length;
    const perluPerbaikan = filtered.filter((r) => r.hasil_kategori === "perlu_perbaikan").length;

    return {
      total,
      avgKepatuhan: Math.round(sumKepatuhan / total),
      baik,
      cukup,
      perluPerbaikan,
    };
  }, [filtered]);

  const handleExport = () => {
    const periodLabel =
      filterMode === "bulan" ? `${BULAN_LIST[bulan]}_${tahun}` : `Semua_Data_${tahun}`;
    generateSupervisiExcel(filtered, `Rekap_Supervisi_PKRS_${periodLabel}.xlsx`);
  };

  const fmtDate = (d?: string | null) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const hasilBadge = (k: string) => {
    if (k === "baik") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    if (k === "cukup") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";
  };

  const hasilLabel = (k: string) =>
    ({ baik: "Baik", cukup: "Cukup", perlu_perbaikan: "Perlu Perbaikan" }[k] ?? k);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Laporan Rekap Supervisi Bulanan
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitoring kepatuhan edukasi & promosi kesehatan unit / ruang kerja
          </p>
        </div>
        <Button
          id="btn-export-supervisi-excel"
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Excel ({filtered.length} data)
        </Button>
      </div>

      {/* Filter Card */}
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filter Supervisi</h3>
        </div>

        <div className="flex gap-2 mb-4">
          {(["bulan", "semua"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setFilterMode(m);
                setPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                filterMode === m
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background text-muted-foreground border-input hover:border-primary/40"
              )}
            >
              {m === "bulan" ? "Per Bulan" : "Semua Data"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {filterMode === "bulan" && (
            <>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Bulan
                </label>
                <select
                  value={bulan}
                  onChange={(e) => {
                    setBulan(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {BULAN_LIST.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Tahun
                </label>
                <select
                  value={tahun}
                  onChange={(e) => {
                    setTahun(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className={filterMode === "semua" ? "sm:col-span-3" : ""}>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari unit atau supervisor..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Total Supervisi</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Unit terevaluasi</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Rata-rata Kepatuhan</p>
          <p className="text-2xl font-bold text-primary mt-1">{stats.avgKepatuhan}%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Skor indikator PKRS</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Predikat Baik</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.baik}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">&gt; 80% Kepatuhan</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Perlu Perbaikan</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{stats.perluPerbaikan}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Butuh tindak lanjut</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                {["No", "Tanggal", "Unit / Ruang", "Supervisor", "Kepatuhan", "Predikat", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide first:pl-5 last:pr-5"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground text-sm">
                    Tidak ada data supervisi untuk filter yang dipilih
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 pl-5 text-muted-foreground">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {fmtDate(row.tanggal_supervisi)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{row.unit_ruang || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.supervisor || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-border">
                          <div
                            className={cn(
                              "h-1.5 rounded-full",
                              row.hasil_kategori === "baik"
                                ? "bg-emerald-500"
                                : row.hasil_kategori === "cukup"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            )}
                            style={{
                              width: `${Math.min(100, row.persentase_kepatuhan ?? 0)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold">
                          {(row.persentase_kepatuhan ?? 0).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-semibold",
                          hasilBadge(row.hasil_kategori)
                        )}
                      >
                        {hasilLabel(row.hasil_kategori)}
                      </span>
                    </td>
                    <td className="px-4 py-3 pr-5">
                      {row.status === "selesai" ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border">
          {paginated.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Tidak ada data supervisi untuk filter yang dipilih
            </div>
          ) : (
            paginated.map((row) => (
              <div key={row.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{row.unit_ruang || "-"}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.supervisor} • {fmtDate(row.tanggal_supervisi)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                      hasilBadge(row.hasil_kategori)
                    )}
                  >
                    {hasilLabel(row.hasil_kategori)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-border">
                    <div
                      className={cn(
                        "h-1.5 rounded-full",
                        row.hasil_kategori === "baik"
                          ? "bg-emerald-500"
                          : row.hasil_kategori === "cukup"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      )}
                      style={{ width: `${Math.min(100, row.persentase_kepatuhan ?? 0)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold">
                    {(row.persentase_kepatuhan ?? 0).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemName="data supervisi"
      />
    </div>
  );
}
