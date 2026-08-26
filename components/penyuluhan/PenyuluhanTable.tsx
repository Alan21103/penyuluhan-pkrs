"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generatePDF, getPDFFilename } from "@/lib/pdf-generator";
import { cn } from "@/lib/utils";
import {
  Plus, Search, FileText, Pencil, Trash2,
  CheckCircle2, Clock, ChevronLeft, ChevronRight, FileDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PDFPreviewModal from "@/components/penyuluhan/PDFPreviewModal";
import type jsPDF from "jspdf";

interface PenyuluhanRow {
  id: string;
  hari_tanggal: string;
  topik: string;
  tempat: string;
  penyuluh: string[];
  sasaran: string;
  jumlah_peserta: number;
  status: "draft" | "selesai";
  created_at: string;
}

const STATUS_CONFIG = {
  draft: { label: "Draft", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200" },
  selesai: { label: "Selesai", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const PAGE_SIZE = 10;

export default function PenyuluhanTable({ data }: { data: PenyuluhanRow[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<jsPDF | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(
      (r) =>
        r.topik?.toLowerCase().includes(q) ||
        r.tempat?.toLowerCase().includes(q) ||
        r.sasaran?.toLowerCase().includes(q) ||
        r.penyuluh?.some((p) => p.toLowerCase().includes(q))
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("penyuluhan").delete().eq("id", deleteId);
    if (error) {
      alert("Gagal menghapus data: " + error.message);
      setDeleting(false);
      return;
    }
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Daftar Penyuluhan</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data.length} kegiatan terdaftar
          </p>
        </div>
        <Link href="/penyuluhan/tambah">
          <Button id="btn-tambah-penyuluhan" className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" />
            Tambah Kegiatan
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          id="input-search-penyuluhan"
          type="text"
          placeholder="Cari topik, tempat, penyuluh..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Topik</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tempat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Penyuluh</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Peserta</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FileText className="w-10 h-10 opacity-30" />
                      <p className="text-sm font-medium">
                        {search ? "Tidak ada hasil pencarian" : "Belum ada data penyuluhan"}
                      </p>
                      {!search && (
                        <Link href="/penyuluhan/tambah">
                          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 mt-1">
                            <Plus className="w-3.5 h-3.5" /> Tambah Pertama
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => {
                  const status = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.draft;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-foreground">{fmt(row.hari_tanggal)}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <Link href={`/penyuluhan/${row.id}`} className="group">
                          <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{row.topik}</p>
                          <p className="text-xs text-muted-foreground">{row.sasaran}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-foreground/80 max-w-[150px] truncate">{row.tempat}</td>
                      <td className="px-4 py-3 text-foreground/80 max-w-[160px] truncate">
                        {row.penyuluh?.join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3 text-foreground/80">{row.jumlah_peserta} orang</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
                          status.className
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`btn-pdf-${row.id}`}
                            title="Export PDF"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                            onClick={async () => {
                              const { data } = await supabase.from("penyuluhan").select("*").eq("id", row.id).single();
                              if (data) {
                                const doc = await generatePDF(data as any);
                                setPreviewDoc(doc);
                                setPreviewFileName(getPDFFilename(data as any));
                              }
                            }}
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          <Link href={`/penyuluhan/${row.id}/edit`}>
                            <button
                              id={`btn-edit-${row.id}`}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <button
                            id={`btn-delete-${row.id}`}
                            onClick={() => setDeleteId(row.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-card rounded-2xl border border-border shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Hapus Data Penyuluhan?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Data yang dihapus tidak dapat dikembalikan. Semua dokumen terkait juga akan ikut terhapus.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                id="btn-cancel-delete"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl"
                onClick={handleDelete}
                disabled={deleting}
                id="btn-confirm-delete"
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <PDFPreviewModal
        isOpen={!!previewDoc}
        onClose={() => { setPreviewDoc(null); setPreviewFileName(""); }}
        pdfDoc={previewDoc}
        fileName={previewFileName}
      />
    </>
  );
}
