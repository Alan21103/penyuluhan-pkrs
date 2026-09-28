"use client";

import { useState } from "react";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";
import { supervisiService } from "@/services/supervisi.service";
import type { SupervisiBulanan } from "@/types/supervisi";

interface SupervisiDeleteDialogProps {
  data: SupervisiBulanan | null;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SupervisiDeleteDialog({
  data,
  isOpen,
  onClose,
  onSuccess,
}: SupervisiDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const { error } = await supervisiService.delete(data.id);
      if (error) throw new Error(error);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Gagal menghapus data supervisi:", error);
      alert("Terjadi kesalahan saat menghapus data supervisi bulanan.");
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
      title="Hapus Data Supervisi Bulanan?"
      itemName={
        data
          ? `Unit: ${data.unit_ruang || "-"} (${data.bulan_periode || "-"}) — Supervisor: ${data.supervisor || "-"}`
          : undefined
      }
      description="Data formulir supervisi bulanan ini beserta checklist dan tindak lanjutnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
    />
  );
}
