"use client";

import React from "react";
import { ClipboardCheck } from "lucide-react";
import { FormData, SectionCard, InputField } from "./FormShared";

interface SectionChecklistProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
}

export default function SectionChecklist({ form, set }: SectionChecklistProps) {
  return (
    <SectionCard id="D" label="Pelaksanaan — Checklist Evaluasi Proses" icon={ClipboardCheck}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground w-6">No</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground">Item Evaluasi</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground w-16">Ya</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground w-16">Tidak</th>
              <th className="text-left py-2 pl-3 text-xs font-semibold text-muted-foreground">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {form.checklist_evaluasi.map((item, i) => (
              <tr key={i} className="hover:bg-muted/20 transition-colors">
                <td className="py-3 pr-4 text-muted-foreground text-xs">{i + 1}</td>
                <td className="py-3 pr-4 text-foreground/90">{item.item}</td>
                <td className="py-3 px-3 text-center">
                  <input
                    type="checkbox"
                    id={`checklist-ya-${i}`}
                    checked={item.ya}
                    onChange={(e) => {
                      const cl = [...form.checklist_evaluasi];
                      cl[i] = { ...cl[i], ya: e.target.checked, tidak: e.target.checked ? false : cl[i].tidak };
                      set("checklist_evaluasi", cl);
                    }}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                </td>
                <td className="py-3 px-3 text-center">
                  <input
                    type="checkbox"
                    id={`checklist-tidak-${i}`}
                    checked={item.tidak}
                    onChange={(e) => {
                      const cl = [...form.checklist_evaluasi];
                      cl[i] = { ...cl[i], tidak: e.target.checked, ya: e.target.checked ? false : cl[i].ya };
                      set("checklist_evaluasi", cl);
                    }}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                </td>
                <td className="py-3 pl-3">
                  <InputField
                    id={`checklist-ket-${i}`}
                    placeholder="Keterangan (opsional)"
                    value={item.keterangan}
                    onChange={(e) => {
                      const cl = [...form.checklist_evaluasi];
                      cl[i] = { ...cl[i], keterangan: e.target.value };
                      set("checklist_evaluasi", cl);
                    }}
                    className="h-8 text-xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
