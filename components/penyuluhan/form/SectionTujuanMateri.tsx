"use client";

import React from "react";
import { Plus, Trash2, ListChecks, BookOpen } from "lucide-react";
import { FormData, SectionCard, InputField } from "./FormShared";

interface SectionTujuanMateriProps {
  form: FormData;
  addItem: (key: "tujuan_penyuluhan" | "materi_disampaikan" | "penyuluh") => void;
  updateItem: (key: "tujuan_penyuluhan" | "materi_disampaikan" | "penyuluh", idx: number, val: string) => void;
  removeItem: (key: "tujuan_penyuluhan" | "materi_disampaikan" | "penyuluh", idx: number) => void;
}

export default function SectionTujuanMateri({
  form,
  addItem,
  updateItem,
  removeItem,
}: SectionTujuanMateriProps) {
  return (
    <>
      {/* ══ SECTION B — Tujuan Penyuluhan ══ */}
      <SectionCard id="B" label="Tujuan Penyuluhan" icon={ListChecks}>
        <div className="space-y-2">
          {form.tujuan_penyuluhan.map((t, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="w-6 h-10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                {i + 1}.
              </span>
              <InputField
                id={`input-tujuan-${i}`}
                value={t}
                onChange={(e) => updateItem("tujuan_penyuluhan", i, e.target.value)}
                placeholder={i === 0 ? "Peserta dapat memahami definisi penyakit secara umum." : "Ketik tujuan spesifik lainnya..."}
              />
              {form.tujuan_penyuluhan.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("tujuan_penyuluhan", i)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          id="btn-tambah-tujuan"
          onClick={() => addItem("tujuan_penyuluhan")}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/40 text-sm text-primary hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Tujuan
        </button>
      </SectionCard>

      {/* ══ SECTION C — Materi yang Disampaikan ══ */}
      <SectionCard id="C" label="Materi yang Disampaikan" icon={BookOpen}>
        <div className="space-y-2">
          {form.materi_disampaikan.map((m, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="w-6 h-10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                {i + 1}.
              </span>
              <InputField
                id={`input-materi-${i}`}
                value={m}
                onChange={(e) => updateItem("materi_disampaikan", i, e.target.value)}
                placeholder="Ketik poin materi yang disampaikan..."
              />
              {form.materi_disampaikan.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("materi_disampaikan", i)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          id="btn-tambah-materi"
          onClick={() => addItem("materi_disampaikan")}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/40 text-sm text-primary hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Materi
        </button>
      </SectionCard>
    </>
  );
}
