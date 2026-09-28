"use client";

import React from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: React.ReactNode;
  itemName?: string;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Hapus Data?",
  description,
  itemName,
  loading = false,
  confirmText = "Hapus",
  cancelText = "Batal",
}: DeleteConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <AlertDialogContent>
        {/* Destructive Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <AlertDialogHeader>
          <AlertDialogTitle id="delete-dialog-title">{title}</AlertDialogTitle>

          {itemName && (
            <div className="my-2 px-3 py-2 rounded-xl bg-muted/60 border border-border/60 text-xs font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">{itemName}</span>
            </div>
          )}

          <AlertDialogDescription>
            {description || (
              <span>
                Data yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin melanjutkan?
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={loading} id="btn-cancel-delete">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            variant="destructive"
            id="btn-confirm-delete"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
