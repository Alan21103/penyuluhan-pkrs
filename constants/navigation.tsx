import {
  LayoutDashboard,
  ClipboardList,
  FileSpreadsheet,
  ClipboardCheck,
} from "lucide-react";
import React from "react";

export interface NavSubItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  shortLabel?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
}

export function AuditIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
    >
      <g>
        <path
          fill="currentColor"
          d="M12.77,12.72a1.07,1.07,0,0,1-1.52,0L9.76,11.23l.76-.76L12,11.93l4.2-4.2.81.79Z"
        />
        <path
          fill="currentColor"
          opacity={0.75}
          d="M16,11.59a.91.91,0,0,0-.81.81,3.21,3.21,0,0,1-2.86,2.76,3.25,3.25,0,0,1-1.84-.36,3.19,3.19,0,0,1,1.2-6,3.07,3.07,0,0,1,1.21.13.9.9,0,0,0,1-.28h0a.91.91,0,0,0-.4-1.45A5,5,0,0,0,7,12.49,5,5,0,0,0,12.48,17,5,5,0,0,0,17,12.63a.91.91,0,0,0-1-1Z"
        />
        <path
          fill="currentColor"
          opacity={0.5}
          d="M12,18a2,2,0,1,1-2,2,2,2,0,0,1,2-2"
        />
        <path
          fill="currentColor"
          opacity={0.5}
          d="M12,2a2,2,0,1,1-2,2,2,2,0,0,1,2-2"
        />
        <path
          fill="currentColor"
          d="M18,20a1,1,0,0,1-.71-1.7L20,15.59V8.41L17.31,5.7a1,1,0,0,1,0-1.41,1,1,0,0,1,1.42,0l3,3A1,1,0,0,1,22,8v8a1,1,0,0,1-.29.7l-3,3A1,1,0,0,1,18,20Z"
        />
        <path
          fill="currentColor"
          opacity={0.75}
          d="M6,20a1,1,0,0,1-.71-.3l-3-3A1,1,0,0,1,2,16V8a1,1,0,0,1,.29-.71l3-3a1,1,0,0,1,1.42,0,1,1,0,0,1,0,1.41L4,8.41v7.18L6.69,18.3a1,1,0,0,1,0,1.42A1,1,0,0,1,6,20Z"
        />
      </g>
    </svg>
  );
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    shortLabel: "Beranda",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Data Penyuluhan",
    shortLabel: "Penyuluhan",
    href: "/penyuluhan",
    icon: ClipboardList,
    subItems: [
      { label: "Semua Kegiatan", href: "/penyuluhan" },
      { label: "Tambah Kegiatan", href: "/penyuluhan/tambah" },
    ],
  },
  {
    label: "Supervisi Bulanan",
    shortLabel: "Supervisi",
    href: "/supervisi",
    icon: ClipboardCheck,
    subItems: [
      { label: "Semua Supervisi", href: "/supervisi" },
      { label: "Tambah Supervisi", href: "/supervisi/tambah" },
    ],
  },
  {
    label: "Audit Indikator Mutu",
    shortLabel: "Audit Mutu",
    href: "/audit-mutu",
    icon: AuditIcon,
    subItems: [
      { label: "Semua Audit", href: "/audit-mutu" },
      { label: "Tambah Audit", href: "/audit-mutu/tambah" },
    ],
  },
  {
    label: "Laporan",
    shortLabel: "Laporan",
    href: "/laporan",
    icon: FileSpreadsheet,
    subItems: [
      { label: "Rekap Laporan", href: "/laporan" },
      { label: "Media Edukasi", href: "/media-edukasi" },
      { label: "Tambah Media", href: "/media-edukasi/tambah" },
    ],
  },
];
