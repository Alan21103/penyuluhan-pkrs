"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Download,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auditMutuService } from "@/services/audit-mutu.service";
import { generateAuditMutuExcel } from "@/services/export/audit-mutu-excel";
import { downloadAuditMutuPDF } from "@/services/export/audit-mutu-pdf";
import type { AuditMutu } from "@/types/audit-mutu";

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

function getAvgCapaian(row: AuditMutu): number {
  const items = row.checklist_audit ?? [];
  if (items.length === 0) return 0;
  const total = items.reduce((acc, curr) => acc + (curr.capaian || 0), 0);
  return Math.round((total / items.length) * 10) / 10;
}

export default function AuditMutuTable() {
  const [data, setData] = useState<AuditMutu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await auditMutuService.getAll();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = data.filter((d) => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.unit_ruangan?.toLowerCase().includes(q) ||
      d.auditor?.toLowerCase().includes(q) ||
      d.periode_audit?.toLowerCase().includes(q) ||
      d.bulan?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data audit indikator mutu ini?")) return;
    setDeletingId(id);
    await auditMutuService.delete(id);
    await load();
    setDeletingId(null);
  };

  const handleExportExcel = () => {
    generateAuditMutuExcel(filtered, `Rekap_Audit_Mutu_${new Date().getFullYear()}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="search-audit-mutu"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari unit, auditor, periode..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="rounded-xl gap-1.5 cursor-pointer"
            id="btn-export-excel-audit"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </Button>
          <Link href="/audit-mutu/tambah">
            <Button
              size="sm"
              className="rounded-xl gap-1.5 bg-primary cursor-pointer"
              id="btn-tambah-audit"
            >
              <Plus className="w-4 h-4" /> Tambah Audit
            </Button>
          </Link>
        </div>
      </div>

      {/* Table & Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <AlertCircle className="w-10 h-10 opacity-40" />
          <p className="text-sm">
            {search ? "Tidak ada hasil pencarian" : "Belum ada data audit indikator mutu"}
          </p>
          {!search && (
            <Link href="/audit-mutu/tambah">
              <Button size="sm" className="rounded-xl gap-1.5 mt-2 cursor-pointer">
                <Plus className="w-4 h-4" /> Tambah Pertama
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden bg-card">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {["Tanggal", "Periode", "Unit / Ruangan", "Auditor", "Rata-rata Capaian", "Status", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide first:pl-5 last:pr-5 last:text-right"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row) => {
                  const avg = getAvgCapaian(row);
                  const met = avg >= 80;
                  return (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 pl-5 text-muted-foreground whitespace-nowrap">
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
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/audit-mutu/${row.id}`}>
                            <button
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                              title="Lihat detail"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </Link>
                          <Link href={`/audit-mutu/${row.id}/edit`}>
                            <button
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </Link>
                          <button
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                            title="Export PDF"
                            onClick={() => downloadAuditMutuPDF(row)}
                          >
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Hapus"
                            onClick={() => handleDelete(row.id)}
                            disabled={deletingId === row.id}
                          >
                            {deletingId === row.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {filtered.map((row) => {
              const avg = getAvgCapaian(row);
              const met = avg >= 80;
              return (
                <div key={row.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {row.unit_ruangan || "-"}
                      </p>
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

                  <div className="flex gap-2 pt-1">
                    <Link href={`/audit-mutu/${row.id}`} className="flex-1">
                      <button className="w-full py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Lihat
                      </button>
                    </Link>
                    <Link href={`/audit-mutu/${row.id}/edit`}>
                      <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <button
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      onClick={() => downloadAuditMutuPDF(row)}
                    >
                      <Download className="w-3.5 h-3.5" />
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
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-right">
        Menampilkan {filtered.length} dari {data.length} data
      </p>
    </div>
  );
}
