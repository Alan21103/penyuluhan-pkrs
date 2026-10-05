"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Plus, Search, Eye, Pencil, Trash2, FileSpreadsheet,
  Loader2, AlertCircle, CheckCircle2, Clock, FilterX, RotateCcw, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/DatePicker";
import { mediaEdukasiService } from "@/services/media-edukasi.service";
import { generateMediaEdukasiExcel } from "@/services/export/media-edukasi-excel";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";
import MediaEdukasiDeleteDialog from "@/components/media-edukasi/MediaEdukasiDeleteDialog";
import TablePagination from "@/components/shared/TablePagination";

const PAGE_SIZE = 10;

const fmtDate = (d?: string | null) => {
  if (!d) return "-";
  try { return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
};

export default function MediaEdukasiTable() {
  const [data, setData] = useState<LaporanMediaEdukasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<LaporanMediaEdukasi | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await mediaEdukasiService.getAll();
      setData(result || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, startDate, endDate]);

  const handleResetFilter = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  const filtered = data.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      d.periode_bulan?.toLowerCase().includes(q) ||
      d.tahun?.toString().toLowerCase().includes(q) ||
      d.penanggung_jawab?.toLowerCase().includes(q) ||
      d.petugas_pelaporan?.toLowerCase().includes(q) ||
      (d.items && d.items.some(i => i.judul_materi?.toLowerCase().includes(q) || i.tanggal_nomor?.toLowerCase().includes(q)));

    let matchesDate = true;
    if (startDate || endDate) {
      const itemDates = (d.items || []).map(i => i.tanggal_nomor).filter(Boolean);
      const docDateStr = d.created_at ? d.created_at.split('T')[0] : '';
      const dateList = [...itemDates, docDateStr];

      if (startDate && endDate) {
        matchesDate = dateList.some(date => date >= startDate && date <= endDate);
      } else if (startDate) {
        matchesDate = dateList.some(date => date >= startDate);
      } else if (endDate) {
        matchesDate = dateList.some(date => date <= endDate);
      }
    }

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportExcel = () => {
    generateMediaEdukasiExcel(filtered, `Rekap_Media_Edukasi_${new Date().getFullYear()}.xlsx`);
  };

  const isFilterActive = search !== "" || startDate !== "" || endDate !== "";

  return (
    <div className="space-y-4">
      {/* Toolbar & Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 flex-1 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="search-media-edukasi"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari periode, penanggung jawab..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            {/* Date Pickers for Rentang Tanggal */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-40">
                <DatePicker
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  placeholder="Dari Tanggal"
                  locale="id"
                />
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">-</span>
              <div className="w-40">
                <DatePicker
                  value={endDate}
                  onChange={(val) => setEndDate(val)}
                  placeholder="Sampai Tanggal"
                  locale="id"
                />
              </div>
            </div>

            {/* Reset Filter Button */}
            {isFilterActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilter}
                className="rounded-xl text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer h-9 px-2.5"
                title="Reset Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full lg:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="rounded-xl gap-1.5 cursor-pointer" id="btn-export-excel">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </Button>
            <Link href="/media-edukasi/tambah">
              <Button size="sm" className="rounded-xl gap-1.5 bg-primary cursor-pointer" id="btn-tambah-media">
                <Plus className="w-4 h-4" /> Tambah Data
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <AlertCircle className="w-10 h-10 opacity-40" />
          <p className="text-sm">{search ? "Tidak ada hasil pencarian" : "Belum ada data media edukasi"}</p>
          {!search && (
            <Link href="/media-edukasi/tambah">
              <Button size="sm" className="rounded-xl gap-1.5 mt-2 cursor-pointer">
                <Plus className="w-4 h-4" /> Tambah Pertama
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {["Periode", "Tahun", "Penanggung Jawab", "Jumlah Media", "Status", "Aksi"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide first:pl-5 last:pr-5 last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 pl-5 font-medium text-foreground whitespace-nowrap">{row.periode_bulan || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.tahun || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.penanggung_jawab || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {(row.items ?? []).length} Media
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.status === "selesai"
                        ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai</span>
                        : <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold w-fit"><Clock className="w-3.5 h-3.5" /> Draft</span>}
                    </td>
                    <td className="px-4 py-3 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/media-edukasi/${row.id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer" title="Lihat detail"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                        </Link>
                        <Link href={`/media-edukasi/${row.id}/edit`}>
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer" title="Edit"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                        </Link>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Hapus"
                          onClick={() => setDeleteTarget(row)}
                          id={`btn-delete-${row.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {paginated.map((row) => (
              <div key={row.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{row.periode_bulan || "-"} {row.tahun || "-"}</p>
                    <p className="text-xs text-muted-foreground">{row.penanggung_jawab || "-"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      {(row.items ?? []).length} Media
                    </span>
                    {row.status === "selesai"
                      ? <span className="text-[10px] text-emerald-600 font-semibold">Selesai</span>
                      : <span className="text-[10px] text-amber-600 font-semibold">Draft</span>}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href={`/media-edukasi/${row.id}`} className="flex-1">
                    <button className="w-full py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Lihat
                    </button>
                  </Link>
                  <Link href={`/media-edukasi/${row.id}/edit`} className="flex-1">
                    <button className="w-full py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  </Link>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                    onClick={() => setDeleteTarget(row)}
                    id={`btn-mobile-delete-${row.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Table Pagination */}
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemName="laporan media"
          />
        </div>
      )}

      {/* Dialog Konfirmasi Hapus Data Media Edukasi */}
      <MediaEdukasiDeleteDialog
        data={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={load}
      />
    </div>
  );
}
