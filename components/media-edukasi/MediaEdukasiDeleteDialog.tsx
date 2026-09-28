"use client";

import { useState } from "react";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";
import { mediaEdukasiService } from "@/services/media-edukasi.service";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";

interface MediaEdukasiDeleteDialogProps {
  data: LaporanMediaEdukasi | null;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MediaEdukasiDeleteDialog({
  data,
  isOpen,
  onClose,
  onSuccess,
}: MediaEdukasiDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!data) return;
    setLoading(true);
    try {
      await mediaEdukasiService.delete(data.id);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Gagal menghapus data media edukasi:", error);
      alert("Terjadi kesalahan saat menghapus data laporan media edukasi.");
    } finally {
      setLoading(false);
    }
  };

  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(data);

  return (
    <DeleteConfirmModal
      isOpen={isModalOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      loading={loading}
      title="Hapus Laporan Media Edukasi?"
      itemName={
        data
          ? `Periode ${data.periode_bulan || "-"} ${data.tahun || "-"} (${(data.items ?? []).length} media)`
          : undefined
      }
      description="Data laporan media edukasi ini beserta seluruh item media yang tercatat di dalamnya akan dihapus permanen dari sistem. Tindakan ini tidak dapat dibatalkan."
    />
  );
}
