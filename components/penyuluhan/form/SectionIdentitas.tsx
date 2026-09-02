"use client";

import React, { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";
import { Plus, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FormData,
  SectionCard,
  FieldLabel,
  InputField,
  SelectField,
  MultiCheckbox,
  SASARAN_OPTIONS,
  METODE_OPTIONS,
  MEDIA_OPTIONS,
} from "./FormShared";

interface SectionIdentitasProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
  addItem: (key: "tujuan_penyuluhan" | "materi_disampaikan" | "penyuluh") => void;
  updateItem: (key: "tujuan_penyuluhan" | "materi_disampaikan" | "penyuluh", idx: number, val: string) => void;
  removeItem: (key: "tujuan_penyuluhan" | "materi_disampaikan" | "penyuluh", idx: number) => void;
  initialSasaran?: string;
}

export default function SectionIdentitas({
  form,
  set,
  addItem,
  updateItem,
  removeItem,
  initialSasaran,
}: SectionIdentitasProps) {
  const isSasaranPreset = (SASARAN_OPTIONS as readonly string[]).includes(form.sasaran);
  const [isCustomSasaran, setIsCustomSasaran] = useState(
    Boolean(initialSasaran && !isSasaranPreset)
  );

  return (
    <SectionCard id="A" label="Identitas Kegiatan" icon={Info}>
      {/* Tanggal & Waktu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <FieldLabel required>Tanggal Pelaksanaan</FieldLabel>
          <DatePicker
            id="input-hari-tanggal"
            value={form.hari_tanggal}
            onChange={(val) => set("hari_tanggal", val)}
            placeholder="Pilih tanggal"
            locale="id"
          />
        </div>
        <div>
          <FieldLabel required>Waktu Mulai</FieldLabel>
          <InputField
            id="input-waktu-mulai"
            type="time"
            value={form.waktu_mulai}
            onChange={(e) => set("waktu_mulai", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel required>Waktu Selesai</FieldLabel>
          <InputField
            id="input-waktu-selesai"
            type="time"
            value={form.waktu_selesai}
            onChange={(e) => set("waktu_selesai", e.target.value)}
          />
        </div>
      </div>

      {/* Ruang & Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <FieldLabel required>Ruang / Lokasi</FieldLabel>
          <InputField
            id="input-tempat"
            placeholder="Ruang Perawatan / Poliklinik / dll"
            value={form.tempat}
            onChange={(e) => set("tempat", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel required>Unit / Instansi</FieldLabel>
          <InputField
            id="input-unit-instansi"
            placeholder="Nama unit/ruangan"
            value={form.unit_instansi}
            onChange={(e) => set("unit_instansi", e.target.value)}
          />
        </div>
      </div>

      {/* Topik */}
      <div className="mb-4">
        <FieldLabel required>Topik Penyuluhan</FieldLabel>
        <InputField
          id="input-topik"
          placeholder="Masukkan judul / topik materi penyuluhan"
          value={form.topik}
          onChange={(e) => set("topik", e.target.value)}
        />
      </div>

      {/* Sasaran & Estimasi Peserta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <FieldLabel required>Sasaran</FieldLabel>
          <div className="space-y-2">
            <SelectField
              id="select-sasaran"
              value={
                isCustomSasaran || (!isSasaranPreset && form.sasaran !== "")
                  ? "Lainnya"
                  : form.sasaran
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === "Lainnya") {
                  setIsCustomSasaran(true);
                  if (isSasaranPreset) set("sasaran", "");
                } else {
                  setIsCustomSasaran(false);
                  set("sasaran", val);
                }
              }}
            >
              <option value="" disabled>-- Pilih Sasaran --</option>
              {SASARAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </SelectField>

            {(isCustomSasaran || (!isSasaranPreset && form.sasaran !== "")) && (
              <InputField
                id="input-sasaran-lainnya"
                placeholder="Masukkan sasaran lainnya..."
                value={form.sasaran}
                onChange={(e) => set("sasaran", e.target.value)}
                autoFocus
              />
            )}
          </div>
        </div>
        <div>
          <FieldLabel required>Estimasi Peserta</FieldLabel>
          <div className="relative">
            <InputField
              id="input-jumlah-peserta"
              type="number"
              min={0}
              value={form.jumlah_peserta || ""}
              onChange={(e) => set("jumlah_peserta", e.target.value === "" ? 0 : Number(e.target.value))}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              Orang
            </span>
          </div>
        </div>
      </div>

      {/* Penyuluh (dynamic list) */}
      <div className="mb-4">
        <FieldLabel required>Nama Penyuluh</FieldLabel>
        <div className="space-y-2">
          {form.penyuluh.map((p, i) => (
            <div key={i} className="flex gap-2">
              <InputField
                id={`input-penyuluh-${i}`}
                placeholder={`Nama staf medis/edukator ${i + 1}`}
                value={p}
                onChange={(e) => updateItem("penyuluh", i, e.target.value)}
              />
              {form.penyuluh.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("penyuluh", i)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            id="btn-tambah-penyuluh"
            onClick={() => addItem("penyuluh")}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Penyuluh
          </button>
        </div>
      </div>

      {/* Durasi */}
      <div className="mb-4">
        <FieldLabel>Durasi (menit)</FieldLabel>
        <div className="flex flex-wrap items-center gap-2.5">
          {[30, 45, 60].map((d) => (
            <button
              key={d}
              type="button"
              id={`btn-durasi-${d}`}
              onClick={() => set("durasi", form.durasi === d ? 0 : d)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                form.durasi === d
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
              )}
            >
              {d} Menit
            </button>
          ))}
          <div className="relative w-36">
            <InputField
              id="input-durasi"
              type="number"
              min={0}
              value={form.durasi || ""}
              onChange={(e) => set("durasi", e.target.value === "" ? 0 : Number(e.target.value))}
              placeholder="Lainnya..."
              className="pr-12 text-xs h-9"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              Menit
            </span>
          </div>
        </div>
      </div>

      {/* Metode */}
      <div className="mb-4">
        <FieldLabel>Metode Penyuluhan</FieldLabel>
        <MultiCheckbox
          id="metode"
          options={METODE_OPTIONS}
          value={form.metode}
          onChange={(v) => set("metode", v)}
        />
      </div>

      {/* Media */}
      <div>
        <FieldLabel>Media yang Digunakan</FieldLabel>
        <MultiCheckbox
          id="media"
          options={MEDIA_OPTIONS}
          value={form.media}
          onChange={(v) => set("media", v)}
        />
        {form.media.includes("Lainnya") && (
          <div className="mt-2">
            <InputField
              id="input-media-lainnya"
              placeholder="Sebutkan media lainnya..."
              value={form.media_lainnya}
              onChange={(e) => set("media_lainnya", e.target.value)}
            />
          </div>
        )}
      </div>
    </SectionCard>
  );
}
