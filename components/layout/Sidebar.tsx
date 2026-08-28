"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  ClipboardList,
  FileSpreadsheet,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
} from "lucide-react";

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: {
    text: string;
    count?: number;
    color?: string;
  };
  hasDot?: boolean;
  subItems?: NavSubItem[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Data Penyuluhan",
    href: "/penyuluhan",
    icon: ClipboardList,
    subItems: [
      { label: "Semua Kegiatan", href: "/penyuluhan" },
      { label: "Tambah Kegiatan", href: "/penyuluhan/tambah" },
    ],
  },
  {
    label: "Laporan",
    href: "/laporan",
    icon: FileSpreadsheet,
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    "Data Penyuluhan": true,
  });

  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const toggleSubmenu = (label: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSubmenus((prev) => ({ ...prev, [label]: true }));
    } else {
      setOpenSubmenus((prev) => ({
        ...prev,
        [label]: !prev[label],
      }));
    }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800",
        "transition-all duration-300 ease-in-out shrink-0 select-none z-20",
        isCollapsed ? "w-[76px]" : "w-64"
      )}
    >
      {/* Floating Circular Toggle Button on the Border Line */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3.5 top-6 z-30",
          "w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
          "shadow-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-300",
          "transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        )}
        title={isCollapsed ? "Perluas Menu" : "Kecilkan Menu"}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Header with RSUD Dr. M. Yunus Logo */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-slate-100 dark:border-slate-800/80 px-4 transition-all duration-300 shrink-0",
          isCollapsed ? "justify-center px-2" : "gap-3"
        )}
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700 shrink-0 bg-white flex items-center justify-center shadow-2xs">
          <Image
            src="/images/Logo.jpg"
            alt="Logo RSUD Dr. M. Yunus"
            width={38}
            height={38}
            className="object-contain rounded-lg"
            priority
          />
        </div>

        {!isCollapsed && (
          <div className="min-w-0 flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
              RSUD Dr. M. Yunus
            </span>
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 leading-tight truncate">
              Sistem PKRS Bengkulu
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 p-3 scrollbar-none",
          isCollapsed && "px-2.5"
        )}
      >
        {!isCollapsed && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
            Menu Utama
          </p>
        )}

        {navItems.map((item) => {
          const isExactActive = pathname === item.href;
          const isSubActive =
            item.subItems?.some(
              (sub) => pathname === sub.href || pathname.startsWith(sub.href + "/")
            ) ?? false;
          const isActive = isExactActive || isSubActive;
          const Icon = item.icon;
          const hasSub = Boolean(item.subItems && item.subItems.length > 0);
          const isOpen = openSubmenus[item.label] ?? false;

          if (isCollapsed) {
            return (
              <div key={item.label} className="relative flex justify-center py-1">
                <Link
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group relative",
                    isActive
                      ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs border border-blue-100 dark:border-slate-700"
                      : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.hasDot && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </Link>
              </div>
            );
          }

          return (
            <div key={item.label} className="space-y-1">
              {hasSub ? (
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group cursor-pointer text-left",
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-slate-400 transition-transform duration-200",
                      isOpen && "rotate-180 text-slate-600"
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>

                  {item.badge && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none shadow-2xs">
                        {item.badge.text}
                      </span>
                      {item.badge.count !== undefined && (
                        <span className="bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold px-1.5 py-0.5 rounded-md leading-none">
                          {item.badge.count}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              )}

              {/* Submenu Accordion Items */}
              {hasSub && isOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 transition-all duration-200">
                  {item.subItems?.map((sub) => {
                    const isSubCurrent = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors group",
                          isSubCurrent
                            ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/20"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50/80"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all",
                            isSubCurrent
                              ? "bg-blue-600 dark:bg-blue-400 scale-125"
                              : "bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400"
                          )}
                        />
                        <span className="truncate">{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section: Logout */}
      <div
        className={cn(
          "p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0",
          isCollapsed ? "flex justify-center" : ""
        )}
      >
        <button
          onClick={handleLogout}
          id="btn-logout"
          className={cn(
            "flex items-center gap-3 text-sm font-medium transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl group cursor-pointer",
            isCollapsed
              ? "w-11 h-11 justify-center"
              : "w-full px-3.5 py-2.5"
          )}
          title="Keluar / Logout"
        >
          <LogOut className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-rose-600 transition-colors" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
