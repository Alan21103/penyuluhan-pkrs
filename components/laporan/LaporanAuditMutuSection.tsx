"use client";

import { useState, useMemo } from "react";
import { generateAuditMutuExcel } from "@/services/export/audit-mutu-excel";
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
  Award,
  AlertCircle,
} from "lucide-react";
import type { AuditMutu } from "@/types/audit-mutu";

const PAGE_SIZE = 10;

interface LaporanAuditMutuSectionProps {
  data: AuditMutu[];
}

function getAvgCapaian(row: AuditMutu): number {
  const items = row.checklist_audit ?? [];
  if (items.length === 0) return 0;
  const total = items.reduce((acc, curr) => acc + (curr.capaian || 0), 0);
  return Math.round((total / items.length) * 10) / 10;
}

export default function LaporanAuditMutuSection({ data }: LaporanAuditMutuSectionProps) {
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
        if (!row.tanggal_audit) return false;
        const d = new Date(row.tanggal_audit);
        if (d.getMonth() !== bulan || d.getFullYear() !== tahun) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          row.unit_ruangan?.toLowerCase().includes(q) ||
          row.auditor?.toLowerCase().includes(q) ||
          row.periode_audit?.toLowerCase().includes(q) ||
          row.bulan?.toLowerCase().includes(q);
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
      return { total: 0, avgCapaian: 0, memenuhi: 0, belumMemenuhi: 0 };
    }
    const sumCapaian = filtered.reduce((acc, curr) => acc + getAvgCapaian(curr), 0);
    const memenuhi = filtered.filter((r) => getAvgCapaian(r) >= 80).length;
    const belumMemenuhi = total - memenuhi;

    return {
      total,
      avgCapaian: Math.round((sumCapaian / total) * 10) / 10,
      memenuhi,
      belumMemenuhi,
    };
  }, [filtered]);

  const handleExport = () => {
    const periodLabel =
      filterMode === "bulan" ? `${BULAN_LIST[bulan]}_${tahun}` : `Semua_Data_${tahun}`;
    generateAuditMutuExcel(filtered, `Rekap_Audit_Mutu_PKRS_${periodLabel}.xlsx`);
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Laporan Rekap Audit Indikator Mutu
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pengukuran indikator mutu pelayanan promosi kesehatan rumah sakit
          </p>
        </div>
        <Button
          id="btn-export-audit-excel"
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
          <h3 className="text-sm font-semibold text-foreground">Filter Audit Mutu</h3>
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
                placeholder="Cari unit atau auditor..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Total Audit</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Sesi audit terlaksana</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Rata-rata Capaian</p>
          <p className="text-2xl font-bold text-primary mt-1">{stats.avgCapaian}%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Standar mutu target: 80%</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Memenuhi Standar</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.memenuhi}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Capaian &ge; 80%</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Belum Memenuhi</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{stats.belumMemenuhi}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Capaian &lt; 80%</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                {["No", "Tanggal", "Periode", "Unit / Ruangan", "Auditor", "Rata-rata Capaian", "Status"].map(
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
                    Tidak ada data audit mutu untuk filter yang dipilih
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => {
                  const avg = getAvgCapaian(row);
                  const met = avg >= 80;
                  return (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 pl-5 text-muted-foreground">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {fmtDate(row.tanggal_audit)}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                        {row.periode_audit || row.bulan || "-"}
                      </td>
                      <td className="px-4 py-3 text-foreground">{row.unit_ruangan || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.auditor || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-border">
                            <div
                              className={cn(
                                "h-1.5 rounded-full",
                                met ? "bg-emerald-500" : "bg-rose-500"
                              )}
                              style={{ width: `${Math.min(100, avg)}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-bold",
                              met ? "text-emerald-600" : "text-rose-600"
                            )}
                          >
                            {avg}%
                          </span>
                        </div>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border">
          {paginated.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Tidak ada data audit mutu untuk filter yang dipilih
            </div>
          ) : (
            paginated.map((row) => {
              const avg = getAvgCapaian(row);
              const met = avg >= 80;
              return (
                <div key={row.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{row.unit_ruangan || "-"}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.auditor} • {row.periode_audit || row.bulan} • {fmtDate(row.tanggal_audit)}
                      </p>
                    </div>
                    {row.status === "selesai" ? (
                      <span className="text-[11px] text-emerald-600 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                        Selesai
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-border">
                      <div
                        className={cn(
                          "h-1.5 rounded-full",
                          met ? "bg-emerald-500" : "bg-rose-500"
                        )}
                        style={{ width: `${Math.min(100, avg)}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold",
                        met ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {avg}%
                    </span>
                  </div>
                </div>
              );
            })
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
        itemName="data audit mutu"
      />
    </div>
  );
}
