"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";
import MediaEdukasiDeleteDialog from "@/components/media-edukasi/MediaEdukasiDeleteDialog";

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

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

interface MediaEdukasiDetailProps {
  data: LaporanMediaEdukasi;
}

export default function MediaEdukasiDetail({ data }: MediaEdukasiDetailProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const items = data.items ?? [];
  const totalDistribusi = items.reduce((sum, item) => sum + (Number(item.jumlah_distribusi) || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Nav Sesuai Template Penyuluhan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <Link
          href="/media-edukasi"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/media-edukasi/${data.id}/edit`}>
            <Button variant="outline" className="gap-2 rounded-xl text-xs sm:text-sm cursor-pointer" id="btn-edit-media">
              <Pencil className="w-4 h-4" /> Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2 rounded-xl text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
            onClick={() => setShowDeleteModal(true)}
            id="btn-delete-media"
          >
            <Trash2 className="w-4 h-4" /> Hapus
          </Button>
        </div>
      </div>

      {/* Grid Layout (2/3 konten, 1/3 sidebar info) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Konten Detail — 2/3 lebar */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-5">
          {/* Header Card */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-lg font-bold text-foreground">Laporan Media Edukasi</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Periode: {data.periode_bulan || "-"} • Tahun: {data.tahun || "-"}
            </p>
          </div>

          {/* Section A — Identitas Laporan */}
          <SectionBox letter="A" title="Identitas Laporan">
            <InfoRow label="Periode / Bulan" value={data.periode_bulan} />
            <InfoRow label="Tahun" value={data.tahun} />
            <InfoRow label="Penanggung Jawab" value={data.penanggung_jawab} />
            <InfoRow label="Petugas Pelaporan" value={data.petugas_pelaporan} />
          </SectionBox>

          {/* Section B — Daftar Media Edukasi */}
          <SectionBox letter="B" title="Daftar Media Edukasi">
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">Belum ada item media edukasi.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {items.map((item, index) => (
                  <div key={item.id ?? index} className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2 font-semibold text-muted-foreground">
                      <span className="text-sm text-foreground">{item.judul_materi || "Tanpa Judul"}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.jenis_media || "-"}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Tanggal/Nomor/Edisi</span>
                        <span className="font-medium text-foreground text-xs">{item.tanggal_nomor || "-"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Bentuk Media</span>
                        <span className="font-medium text-foreground text-xs">{item.bentuk_media || "-"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Lokasi/Platform</span>
                        <span className="font-medium text-foreground text-xs">{item.lokasi_platform || "-"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Sasaran</span>
                        <span className="font-medium text-foreground text-xs">{item.sasaran || "-"}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground block text-[11px]">Jumlah Distribusi/Tayangan</span>
                        <span className="font-medium text-foreground text-xs">{item.jumlah_distribusi || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionBox>
        </div>

        {/* Sidebar Kanan — Status + Ringkasan + Riwayat (Template Penyuluhan) */}
        <div className="space-y-4">
          {/* Status Box */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Status Laporan</h3>
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

          {/* Ringkasan Card */}
          <div className="rounded-2xl border p-5 space-y-3 bg-blue-50 border-blue-200 dark:bg-blue-950/20">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Ringkasan</h3>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <span className="text-xs text-blue-700 dark:text-blue-300 block mb-1">Total Media</span>
                <span className="text-xl font-bold text-blue-900 dark:text-blue-100">{items.length}</span>
              </div>
              <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <span className="text-xs text-blue-700 dark:text-blue-300 block mb-1">Distribusi/Tayang</span>
                <span className="text-xl font-bold text-blue-900 dark:text-blue-100">{totalDistribusi}</span>
              </div>
            </div>
          </div>

          {/* Riwayat Card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-foreground">Riwayat Laporan</h3>
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

      {/* Dialog Konfirmasi Hapus Data */}
      <MediaEdukasiDeleteDialog
        data={data}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={() => {
          router.push("/media-edukasi");
          router.refresh();
        }}
      />
    </div>
  );
}
