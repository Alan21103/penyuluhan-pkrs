"use client";

import React from "react";
import { PenLine, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignaturePad from "@/components/penyuluhan/SignaturePad";
import { FormData, SectionCard, FieldLabel, InputField } from "./FormShared";

interface SectionPengesahanProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
  saving: boolean;
  onSave: (status: "draft" | "selesai") => void;
}

export default function SectionPengesahan({
  form,
  set,
  saving,
  onSave,
}: SectionPengesahanProps) {
  return (
    <SectionCard id="TTD" label="Tanda Tangan & Pengesahan" icon={PenLine}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PJ PKRS */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Penanggung Jawab PKRS</h3>
          <div className="space-y-3">
            <div>
              <FieldLabel>Nama</FieldLabel>
              <InputField
                id="input-pj-nama"
                placeholder="Nama lengkap PJ PKRS"
                value={form.pj_pkrs_nama}
                onChange={(e) => set("pj_pkrs_nama", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>NIP</FieldLabel>
              <InputField
                id="input-pj-nip"
                placeholder="Nomor Induk Pegawai"
                value={form.pj_pkrs_nip}
                onChange={(e) => set("pj_pkrs_nip", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Tanda Tangan</FieldLabel>
              <SignaturePad
                id="ttd-pj-pkrs"
                label="PJ PKRS"
                value={form.pj_pkrs_ttd_url || undefined}
                onChange={(v) => set("pj_pkrs_ttd_url", v ?? "")}
              />
            </div>
          </div>
        </div>

        {/* Penyuluh */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Penyuluh</h3>
          <div className="space-y-3">
            <div>
              <FieldLabel>Nama</FieldLabel>
              <InputField
                id="input-penyuluh-ttd-nama"
                placeholder="Nama lengkap penyuluh"
                value={form.penyuluh_nama}
                onChange={(e) => set("penyuluh_nama", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>NIP</FieldLabel>
              <InputField
                id="input-penyuluh-ttd-nip"
                placeholder="Nomor Induk Pegawai"
                value={form.penyuluh_nip}
                onChange={(e) => set("penyuluh_nip", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Tanda Tangan</FieldLabel>
              <SignaturePad
                id="ttd-penyuluh"
                label="Penyuluh"
                value={form.penyuluh_ttd_url || undefined}
                onChange={(v) => set("penyuluh_ttd_url", v ?? "")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-6 border-t border-border">
        <Button
          variant="outline"
          id="btn-draft-bottom"
          className="rounded-xl gap-2 w-full sm:w-auto cursor-pointer"
          onClick={() => onSave("draft")}
          disabled={saving}
        >
          <Save className="w-4 h-4" /> Simpan Draft
        </Button>
        <Button
          id="btn-submit-bottom"
          className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto cursor-pointer"
          onClick={() => onSave("selesai")}
          disabled={saving}
        >
          <CheckCircle className="w-4 h-4" />
          {saving ? "Menyimpan..." : "Simpan & Selesai"}
        </Button>
      </div>
    </SectionCard>
  );
}
