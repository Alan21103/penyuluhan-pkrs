"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Shield,
  ClipboardCheck,
  Save,
  CheckCircle,
  Loader2,
  ChevronLeft,
  AlertCircle,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auditMutuService } from "@/services/audit-mutu.service";
import type { AuditMutu, ChecklistAuditItem, StatusAudit } from "@/types/audit-mutu";
import { DEFAULT_CHECKLIST_AUDIT } from "@/types/audit-mutu";

interface AuditMutuFormProps {
  mode: "create" | "edit";
  initialData?: AuditMutu;
}

function defaultForm(): Partial<AuditMutu> {
  return {
    periode_audit: "",
    bulan: "",
    unit_ruangan: "",
    tanggal_audit: new Date().toISOString().split("T")[0],
    auditor: "",
    checklist_audit: DEFAULT_CHECKLIST_AUDIT.map((item) => ({ ...item })),
    status: "draft",
  };
}

export default function AuditMutuForm({ mode, initialData }: AuditMutuFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<AuditMutu>>(
    initialData
      ? {
          ...initialData,
          checklist_audit:
            initialData.checklist_audit && initialData.checklist_audit.length > 0
              ? initialData.checklist_audit
              : DEFAULT_CHECKLIST_AUDIT.map((item) => ({ ...item })),
        }
      : defaultForm()
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof AuditMutu>(key: K, val: AuditMutu[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const updateChecklistItem = (
    index: number,
    field: keyof ChecklistAuditItem,
    value: any
  ) => {
    const list = [...(form.checklist_audit ?? [])];
    const item = { ...list[index], [field]: value };

    // Auto-calculate capaian when jumlah_sampel or jumlah_sesuai changes
    if (field === "jumlah_sampel" || field === "jumlah_sesuai") {
      const sampel = field === "jumlah_sampel" ? Number(value) : Number(item.jumlah_sampel);
      const sesuai = field === "jumlah_sesuai" ? Number(value) : Number(item.jumlah_sesuai);
      item.capaian = sampel > 0 ? Math.round((sesuai / sampel) * 10000) / 100 : 0;
    }

    list[index] = item;
    setForm((prev) => ({ ...prev, checklist_audit: list }));
  };

  const handleToggleYaTidak = (index: number, type: "ya" | "tidak") => {
    const list = [...(form.checklist_audit ?? [])];
    const current = list[index];

    if (type === "ya") {
      const newVal = !current.ya;
      list[index] = { ...current, ya: newVal, tidak: newVal ? false : null };
    } else {
      const newVal = !current.tidak;
      list[index] = { ...current, tidak: newVal, ya: newVal ? false : null };
    }

    setForm((prev) => ({ ...prev, checklist_audit: list }));
  };

  const handleSubmit = async (targetStatus: StatusAudit) => {
    setError(null);

    if (!form.unit_ruangan?.trim()) {
      setError("Unit / Ruangan wajib diisi.");
      return;
    }
    if (!form.tanggal_audit) {
      setError("Tanggal audit wajib diisi.");
      return;
    }
    if (!form.auditor?.trim()) {
      setError("Nama Auditor wajib diisi.");
      return;
    }

    setSaving(true);
    const payload = { ...form, status: targetStatus };

    try {
      if (mode === "create") {
        const { error: err } = await auditMutuService.create(payload);
        if (err) {
          setError(err);
          setSaving(false);
          return;
        }
      } else if (initialData?.id) {
        const { error: err } = await auditMutuService.update(initialData.id, payload);
        if (err) {
          setError(err);
          setSaving(false);
          return;
        }
      }
      router.push("/audit-mutu");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Terjadi kesalahan saat menyimpan data.");
      setSaving(false);
    }
  };

  // Kalkulasi rata-rata capaian
  const validChecklist = form.checklist_audit ?? [];
  const totalCapaian = validChecklist.reduce((acc, curr) => acc + (curr.capaian || 0), 0);
  const avgCapaian = validChecklist.length > 0 ? (totalCapaian / validChecklist.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* ── Banner Header (Sesuai Desain Tema PKRS) ── */}
      <div className="bg-[#005ca9] text-white rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
            <button
              type="button"
              onClick={() => router.push("/audit-mutu")}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
            <span className="text-white/60">/</span>
            <Link href="/audit-mutu" className="hover:text-white transition-colors">
              Audit Mutu
            </Link>
            <span className="text-white/60">/</span>
            <span className="text-white font-medium">
              {mode === "create" ? "Formulir Baru" : "Edit Formulir"}
            </span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Pengisian Instrumen Indikator Mutu
          </h1>
          <p className="text-xs sm:text-sm text-white/80">
            PKRS RSUD dr. M. Yunus Bengkulu
          </p>
        </div>

        {/* Card Rata-rata Capaian */}
        <div className="flex items-center gap-3.5 bg-white/10 border border-white/20 backdrop-blur-xs rounded-2xl px-5 py-3.5 shrink-0 self-start md:self-auto min-w-[210px]">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold shrink-0">
            <Percent className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
              RATA-RATA CAPAIAN
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-white leading-tight">
              {Number(avgCapaian).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bagian 1: Identitas Audit */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/20">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-foreground">Identitas Audit</h2>
            <p className="text-xs text-muted-foreground">Informasi waktu, lokasi, dan pelaksana audit</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Periode Audit <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Triwulan I / Semester I"
              value={form.periode_audit ?? ""}
              onChange={(e) => updateField("periode_audit", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Bulan / Tahun <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Januari 2026"
              value={form.bulan ?? ""}
              onChange={(e) => updateField("bulan", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Tanggal Audit <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={form.tanggal_audit ?? ""}
              onChange={(e) => updateField("tanggal_audit", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Unit / Ruangan <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: IGD / Rawat Inap Melati"
              value={form.unit_ruangan ?? ""}
              onChange={(e) => updateField("unit_ruangan", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Nama Auditor <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Nama lengkap petugas auditor"
              value={form.auditor ?? ""}
              onChange={(e) => updateField("auditor", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Bagian 2: 8 Indikator Mutu PKRS */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">Instrumen 8 Indikator Mutu</h2>
              <p className="text-xs text-muted-foreground">
                Evaluasi kesesuaian dan kalkulasi otomatis persentase capaian
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {form.checklist_audit?.length ?? 0} Indikator
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-3 text-center w-8">No</th>
                <th className="py-3 px-4 text-left">Indikator Mutu</th>
                <th className="py-3 px-2 text-center w-20">Standar Target</th>
                <th className="py-3 px-2 text-center w-24">Ya / Tidak</th>
                <th className="py-3 px-2 text-center w-20">Jml Sampel</th>
                <th className="py-3 px-2 text-center w-20">Jml Sesuai</th>
                <th className="py-3 px-3 text-center w-24">Capaian (%)</th>
                <th className="py-3 px-4 text-left w-44">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(form.checklist_audit ?? []).map((item, idx) => {
                const targetMet = item.capaian >= 80;
                return (
                  <tr key={item.id || idx} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-3 text-center text-muted-foreground font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 text-foreground font-medium leading-relaxed">
                      {item.indikator}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold text-[11px]">
                        {item.standar_target}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-background">
                        <button
                          type="button"
                          onClick={() => handleToggleYaTidak(idx, "ya")}
                          className={cn(
                            "px-2 py-1 text-[11px] rounded-md font-semibold transition-all cursor-pointer",
                            item.ya
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Ya
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleYaTidak(idx, "tidak")}
                          className={cn(
                            "px-2 py-1 text-[11px] rounded-md font-semibold transition-all cursor-pointer",
                            item.tidak
                              ? "bg-rose-600 text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Tdk
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.jumlah_sampel ?? 0}
                        onChange={(e) => updateChecklistItem(idx, "jumlah_sampel", e.target.value)}
                        className="w-full text-center rounded-lg border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.jumlah_sesuai ?? 0}
                        onChange={(e) => updateChecklistItem(idx, "jumlah_sesuai", e.target.value)}
                        className="w-full text-center rounded-lg border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1",
                          targetMet
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                        )}
                      >
                        {(item.capaian ?? 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Catatan..."
                        value={item.keterangan ?? ""}
                        onChange={(e) => updateChecklistItem(idx, "keterangan", e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-2.5 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile / Tablet Cards View */}
        <div className="lg:hidden divide-y divide-border">
          {(form.checklist_audit ?? []).map((item, idx) => {
            const targetMet = item.capaian >= 80;
            return (
              <div key={item.id || idx} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-xs text-foreground leading-snug">{item.indikator}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Target: <span className="font-semibold text-blue-600 dark:text-blue-400">{item.standar_target}</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full font-bold text-[11px] shrink-0",
                      targetMet
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                    )}
                  >
                    {(item.capaian ?? 0).toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center pt-1">
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1">Kesesuaian</span>
                    <div className="flex items-center rounded-lg border border-border p-0.5 bg-background">
                      <button
                        type="button"
                        onClick={() => handleToggleYaTidak(idx, "ya")}
                        className={cn(
                          "flex-1 py-1 text-[10px] rounded-md font-semibold transition-all cursor-pointer text-center",
                          item.ya ? "bg-emerald-600 text-white" : "text-muted-foreground"
                        )}
                      >
                        Ya
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleYaTidak(idx, "tidak")}
                        className={cn(
                          "flex-1 py-1 text-[10px] rounded-md font-semibold transition-all cursor-pointer text-center",
                          item.tidak ? "bg-rose-600 text-white" : "text-muted-foreground"
                        )}
                      >
                        Tdk
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">Sampel</label>
                    <input
                      type="number"
                      min="0"
                      value={item.jumlah_sampel ?? 0}
                      onChange={(e) => updateChecklistItem(idx, "jumlah_sampel", e.target.value)}
                      className="w-full text-center rounded-lg border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">Sesuai</label>
                    <input
                      type="number"
                      min="0"
                      value={item.jumlah_sesuai ?? 0}
                      onChange={(e) => updateChecklistItem(idx, "jumlah_sesuai", e.target.value)}
                      className="w-full text-center rounded-lg border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Catatan / keterangan..."
                    value={item.keterangan ?? ""}
                    onChange={(e) => updateChecklistItem(idx, "keterangan", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-2.5 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating or Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="text-xs text-muted-foreground">
          Status saat ini:{" "}
          <span className="font-semibold text-foreground capitalize">
            {form.status === "selesai" ? "Selesai" : "Draft"}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => handleSubmit("draft")}
            className="flex-1 sm:flex-initial rounded-xl gap-2 cursor-pointer"
            id="btn-save-draft-audit"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Draft
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit("selesai")}
            className="flex-1 sm:flex-initial rounded-xl gap-2 bg-primary cursor-pointer"
            id="btn-save-selesai-audit"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Selesaikan Audit
          </Button>
        </div>
      </div>
    </div>
  );
}
