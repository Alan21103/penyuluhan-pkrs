"use client";

import { useState } from "react";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";
import { auditMutuService } from "@/services/audit-mutu.service";
import type { AuditMutu } from "@/types/audit-mutu";

interface AuditMutuDeleteDialogProps {
  data: AuditMutu | null;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuditMutuDeleteDialog({
  data,
  isOpen,
  onClose,
  onSuccess,
}: AuditMutuDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const { error } = await auditMutuService.delete(data.id);
      if (error) throw new Error(error);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Gagal menghapus data audit mutu:", error);
      alert("Terjadi kesalahan saat menghapus data audit mutu.");
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
      title="Hapus Data Audit Indikator Mutu?"
      itemName={
        data
          ? `Unit: ${data.unit_ruangan || "-"} (${data.bulan || "-"}) — Auditor: ${data.auditor || "-"}`
          : undefined
      }
      description="Data audit indikator mutu ini beserta seluruh capaian indikatornya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
    />
  );
}
