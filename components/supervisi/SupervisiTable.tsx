"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Plus, Search, Eye, Pencil, Trash2, Download, FileSpreadsheet,
  Loader2, AlertCircle, CheckCircle2, Clock, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supervisiService } from "@/services/supervisi.service";
import { generateSupervisiExcel } from "@/services/export/supervisi-excel";
import { downloadSupervisiPDF } from "@/services/export/supervisi-pdf";
import type { SupervisiBulanan } from "@/types/supervisi";

const fmtDate = (d?: string | null) => {
  if (!d) return "-";
  try { return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
};

const hasilBadge = (k: string) => {
  if (k === "baik") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  if (k === "cukup") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";
};
const hasilLabel = (k: string) => ({ baik: "Baik", cukup: "Cukup", perlu_perbaikan: "Perlu Perbaikan" }[k] ?? k);

export default function SupervisiTable() {
  const router = useRouter();
  const [data, setData] = useState<SupervisiBulanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await supervisiService.getAll();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((d) => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.unit_ruang?.toLowerCase().includes(q) ||
      d.supervisor?.toLowerCase().includes(q) ||
      d.bulan_periode?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data supervisi ini?")) return;
    setDeletingId(id);
    await supervisiService.delete(id);
    await load();
    setDeletingId(null);
  };

  const handleExportExcel = () => {
    generateSupervisiExcel(filtered, `Rekap_Supervisi_${new Date().getFullYear()}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="search-supervisi"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari unit, supervisor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="rounded-xl gap-1.5 cursor-pointer" id="btn-export-excel-supervisi">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </Button>
          <Link href="/supervisi/tambah">
            <Button size="sm" className="rounded-xl gap-1.5 bg-primary cursor-pointer" id="btn-tambah-supervisi">
              <Plus className="w-4 h-4" /> Tambah Supervisi
            </Button>
          </Link>
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
          <p className="text-sm">{search ? "Tidak ada hasil pencarian" : "Belum ada data supervisi"}</p>
          {!search && (
            <Link href="/supervisi/tambah">
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
                  {["Tanggal", "Unit / Ruang", "Supervisor", "Kepatuhan", "Hasil", "Status", "Aksi"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide first:pl-5 last:pr-5 last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 pl-5 text-muted-foreground whitespace-nowrap">{fmtDate(row.tanggal_supervisi)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{row.unit_ruang || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.supervisor || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-border">
                          <div className={cn("h-1.5 rounded-full", row.hasil_kategori === "baik" ? "bg-emerald-500" : row.hasil_kategori === "cukup" ? "bg-amber-500" : "bg-red-500")}
                            style={{ width: `${Math.min(100, row.persentase_kepatuhan ?? 0)}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{(row.persentase_kepatuhan ?? 0).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", hasilBadge(row.hasil_kategori))}>
                        {hasilLabel(row.hasil_kategori)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.status === "selesai"
                        ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai</span>
                        : <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold"><Clock className="w-3.5 h-3.5" /> Draft</span>}
                    </td>
                    <td className="px-4 py-3 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/supervisi/${row.id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer" title="Lihat detail"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                        </Link>
                        <Link href={`/supervisi/${row.id}/edit`}>
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer" title="Edit"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                        </Link>
                        <button
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          title="Export PDF"
                          onClick={() => downloadSupervisiPDF(row)}
                        >
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          title="Hapus"
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id}
                        >
                          {deletingId === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
            {filtered.map((row) => (
              <div key={row.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{row.unit_ruang || "-"}</p>
                    <p className="text-xs text-muted-foreground">{row.supervisor} • {fmtDate(row.tanggal_supervisi)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", hasilBadge(row.hasil_kategori))}>
                      {hasilLabel(row.hasil_kategori)}
                    </span>
                    {row.status === "selesai"
                      ? <span className="text-[10px] text-emerald-600 font-semibold">Selesai</span>
                      : <span className="text-[10px] text-amber-600 font-semibold">Draft</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-border">
                    <div className={cn("h-1.5 rounded-full", row.hasil_kategori === "baik" ? "bg-emerald-500" : row.hasil_kategori === "cukup" ? "bg-amber-500" : "bg-red-500")}
                      style={{ width: `${Math.min(100, row.persentase_kepatuhan ?? 0)}%` }} />
                  </div>
                  <span className="text-xs font-bold">{(row.persentase_kepatuhan ?? 0).toFixed(0)}%</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/supervisi/${row.id}`} className="flex-1">
                    <button className="w-full py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Lihat
                    </button>
                  </Link>
                  <Link href={`/supervisi/${row.id}/edit`} className="flex-1">
                    <button className="w-full py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  </Link>
                  <button
                    className="flex-1 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    onClick={() => downloadSupervisiPDF(row)}
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    onClick={() => handleDelete(row.id)}
                    disabled={deletingId === row.id}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-right">
        Menampilkan {filtered.length} dari {data.length} data
      </p>
    </div>
  );
}
