"use client";

import { useState, useMemo } from "react";
import { generateMediaEdukasiExcel } from "@/services/export/media-edukasi-excel";
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
  Video,
  Layers,
  Send,
} from "lucide-react";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";

const PAGE_SIZE = 10;

interface LaporanMediaEdukasiSectionProps {
  data: LaporanMediaEdukasi[];
}

export default function LaporanMediaEdukasiSection({ data }: LaporanMediaEdukasiSectionProps) {
  const now = new Date();
  const [filterMode, setFilterMode] = useState<"semua" | "bulan">("bulan");
  const [bulanStr, setBulanStr] = useState<string>(BULAN_LIST[now.getMonth()]);
  const [tahunStr, setTahunStr] = useState<string>(String(now.getFullYear()));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - 2 + i));

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (filterMode === "bulan") {
        if (row.periode_bulan !== bulanStr || row.tahun !== tahunStr) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesHeader =
          row.penanggung_jawab?.toLowerCase().includes(q) ||
          row.petugas_pelaporan?.toLowerCase().includes(q) ||
          row.periode_bulan?.toLowerCase().includes(q);
        const matchesItems = (row.items || []).some(
          (it) =>
            it.judul_materi?.toLowerCase().includes(q) ||
            it.jenis_media?.toLowerCase().includes(q) ||
            it.lokasi_platform?.toLowerCase().includes(q) ||
            it.sasaran?.toLowerCase().includes(q)
        );
        if (!matchesHeader && !matchesItems) return false;
      }
      return true;
    });
  }, [data, filterMode, bulanStr, tahunStr, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalLaporan = filtered.length;
    let totalMedia = 0;
    let totalDistribusi = 0;

    filtered.forEach((r) => {
      totalMedia += r.items?.length || 0;
      (r.items || []).forEach((it) => {
        totalDistribusi += Number(it.jumlah_distribusi) || 0;
      });
    });

    const selesai = filtered.filter((r) => r.status === "selesai").length;

    return {
      totalLaporan,
      totalMedia,
      totalDistribusi,
      selesai,
    };
  }, [filtered]);

  const handleExport = () => {
    const periodLabel =
      filterMode === "bulan" ? `${bulanStr}_${tahunStr}` : `Semua_Data_${tahunStr}`;
    generateMediaEdukasiExcel(filtered, `Rekap_Media_Edukasi_PKRS_${periodLabel}.xlsx`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Laporan Rekap Media Edukasi
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Publikasi dan distribusi media promosi kesehatan rumah sakit
          </p>
        </div>
        <Button
          id="btn-export-media-excel"
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Excel ({filtered.length} laporan)
        </Button>
      </div>

      {/* Filter Card */}
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filter Media Edukasi</h3>
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
                  Bulan Periode
                </label>
                <select
                  value={bulanStr}
                  onChange={(e) => {
                    setBulanStr(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {BULAN_LIST.map((m) => (
                    <option key={m} value={m}>
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
                  value={tahunStr}
                  onChange={(e) => {
                    setTahunStr(e.target.value);
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
                placeholder="Cari materi, jenis media, petugas..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Total Dokumen</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.totalLaporan}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Laporan bulanan</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Total Media Edukasi</p>
          <p className="text-2xl font-bold text-primary mt-1">{stats.totalMedia}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Materi & karya rilis</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Total Distribusi</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalDistribusi.toLocaleString("id-ID")}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Eksemplar / tayang</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Status Selesai</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.selesai}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Laporan terverifikasi</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                {["No", "Periode", "Penanggung Jawab", "Petugas Pelapor", "Jumlah Media", "Total Distribusi", "Status"].map(
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
                    Tidak ada data media edukasi untuk filter yang dipilih
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => {
                  const mediaCount = row.items?.length || 0;
                  const distCount = (row.items || []).reduce(
                    (sum, it) => sum + (Number(it.jumlah_distribusi) || 0),
                    0
                  );
                  return (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 pl-5 text-muted-foreground">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                        {row.periode_bulan} {row.tahun}
                      </td>
                      <td className="px-4 py-3 text-foreground">{row.penanggung_jawab || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.petugas_pelaporan || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {mediaCount} media
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {distCount.toLocaleString("id-ID")}
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
              Tidak ada data media edukasi untuk filter yang dipilih
            </div>
          ) : (
            paginated.map((row) => {
              const mediaCount = row.items?.length || 0;
              const distCount = (row.items || []).reduce(
                (sum, it) => sum + (Number(it.jumlah_distribusi) || 0),
                0
              );
              return (
                <div key={row.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {row.periode_bulan} {row.tahun}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PJ: {row.penanggung_jawab} • Pelapor: {row.petugas_pelaporan}
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
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>{mediaCount} Media Edukasi</span>
                    <span className="font-medium text-foreground">{distCount.toLocaleString("id-ID")} Distribusi</span>
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
        itemName="laporan media"
      />
    </div>
  );
}
