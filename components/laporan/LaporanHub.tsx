"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  Video,
} from "lucide-react";
import LaporanView from "@/components/laporan/LaporanView";
import LaporanSupervisiSection from "@/components/laporan/LaporanSupervisiSection";
import LaporanAuditMutuSection from "@/components/laporan/LaporanAuditMutuSection";
import LaporanMediaEdukasiSection from "@/components/laporan/LaporanMediaEdukasiSection";
import type { Penyuluhan } from "@/types/penyuluhan";
import type { SupervisiBulanan } from "@/types/supervisi";
import type { AuditMutu } from "@/types/audit-mutu";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";

type LaporanTab = "penyuluhan" | "supervisi" | "audit-mutu" | "media-edukasi";

interface LaporanHubProps {
  penyuluhanData: Penyuluhan[];
  supervisiData: SupervisiBulanan[];
  auditMutuData: AuditMutu[];
  mediaEdukasiData: LaporanMediaEdukasi[];
}

export default function LaporanHub({
  penyuluhanData,
  supervisiData,
  auditMutuData,
  mediaEdukasiData,
}: LaporanHubProps) {
  const [activeTab, setActiveTab] = useState<LaporanTab>("penyuluhan");

  const tabs: Array<{
    id: LaporanTab;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: "penyuluhan",
      label: "Penyuluhan PKRS",
      count: penyuluhanData.length,
      icon: BookOpen,
    },
    {
      id: "supervisi",
      label: "Supervisi Bulanan",
      count: supervisiData.length,
      icon: ClipboardCheck,
    },
    {
      id: "audit-mutu",
      label: "Indikator Mutu",
      count: auditMutuData.length,
      icon: CheckCircle2,
    },
    {
      id: "media-edukasi",
      label: "Media Edukasi",
      count: mediaEdukasiData.length,
      icon: Video,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="bg-muted/50 p-1.5 rounded-2xl border border-border inline-flex flex-wrap gap-1.5 w-full sm:w-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-initial justify-center whitespace-nowrap",
                isActive
                  ? "bg-card text-foreground shadow-xs border border-border/80 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{t.label}</span>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === "penyuluhan" && <LaporanView data={penyuluhanData} />}
        {activeTab === "supervisi" && <LaporanSupervisiSection data={supervisiData} />}
        {activeTab === "audit-mutu" && <LaporanAuditMutuSection data={auditMutuData} />}
        {activeTab === "media-edukasi" && <LaporanMediaEdukasiSection data={mediaEdukasiData} />}
      </div>
    </div>
  );
}
