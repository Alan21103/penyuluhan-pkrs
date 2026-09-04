"use client";

import { useState, useMemo, useEffect } from "react";
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
  X,
  Menu,
  ClipboardCheck,
  Activity,
} from "lucide-react";

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  shortLabel?: string;
  href: string;
  icon: any;
  subItems?: NavSubItem[];
}

const navItems: NavItem[] = [
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
    icon: Activity,
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
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    "Data Penyuluhan": true,
  });

  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Close mobile drawer whenever route changes and auto-open active submenus
  useEffect(() => {
    setMobileDrawerOpen(false);
    navItems.forEach((item) => {
      if (
        item.subItems?.some(
          (sub) => pathname === sub.href || pathname.startsWith(sub.href + "/")
        )
      ) {
        setOpenSubmenus((prev) => ({ ...prev, [item.label]: true }));
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const toggleSubmenu = (label: string) => {
    if (isDesktopCollapsed) {
      setIsDesktopCollapsed(false);
      setOpenSubmenus((prev) => ({ ...prev, [label]: true }));
    } else {
      setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
    }
  };

  // Determine current page title for mobile top bar
  const currentPage = navItems.find(
    (item) =>
      pathname === item.href ||
      item.subItems?.some(
        (sub) => pathname === sub.href || pathname.startsWith(sub.href + "/")
      )
  );

  let pageTitle = currentPage?.label ?? "SIPINTAR PKRS";
  if (pathname.startsWith("/penyuluhan")) {
    if (pathname.includes("/tambah")) pageTitle = "Tambah Penyuluhan";
    else if (pathname.includes("/edit")) pageTitle = "Edit Penyuluhan";
    else if (pathname === "/penyuluhan") pageTitle = "Data Penyuluhan";
    else pageTitle = "Detail Penyuluhan";
  } else if (pathname.startsWith("/supervisi")) {
    if (pathname.includes("/tambah")) pageTitle = "Tambah Supervisi";
    else if (pathname.includes("/edit")) pageTitle = "Edit Supervisi";
    else if (pathname === "/supervisi") pageTitle = "Supervisi Bulanan";
    else pageTitle = "Detail Supervisi";
  } else if (pathname.startsWith("/audit-mutu")) {
    if (pathname.includes("/tambah")) pageTitle = "Tambah Audit Mutu";
    else if (pathname.includes("/edit")) pageTitle = "Edit Audit Mutu";
    else if (pathname === "/audit-mutu") pageTitle = "Audit Indikator Mutu";
    else pageTitle = "Detail Audit Mutu";
  }

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-background overflow-x-hidden">
      {/* =========================================================================
          1. MOBILE / TABLET TOP BAR (< lg) — Fixed at top
          ========================================================================= */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0d1f3d] border-b border-blue-900/50 z-30 px-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center shadow-2xs">
            <Image
              src="/images/Logo.jpg"
              alt="Logo RSUD"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
          <span className="text-sm font-bold text-white truncate max-w-[200px]">
            {pageTitle}
          </span>
        </div>

        {/* Placeholder spacer for center alignment */}
        <div className="w-9" />
      </header>

      {/* =========================================================================
          2. MOBILE / TABLET DRAWER OVERLAY (< lg)
          ========================================================================= */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden",
          mobileDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 max-w-[80vw] bg-gradient-to-b from-[#0e2142] via-[#0b172e] to-[#070f20] border-r border-blue-900/40 text-white shadow-2xl flex flex-col",
          "transition-transform duration-300 ease-in-out lg:hidden",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center shadow-2xs">
              <Image
                src="/images/Logo.jpg"
                alt="Logo RSUD"
                width={34}
                height={34}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">
                RSUD Dr. M. Yunus
              </span>
              <span className="text-[11px] font-medium text-sky-400 leading-tight">
                SIPINTAR PKRS
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-none">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-300/60 px-3 py-1">
            Menu Utama
          </p>

          {navItems.map((item) => {
            const isExactActive = pathname === item.href;
            const isSubActive =
              item.subItems?.some(
                (sub) =>
                  pathname === sub.href || pathname.startsWith(sub.href + "/")
              ) ?? false;
            const isActive = isExactActive || isSubActive;
            const Icon = item.icon;
            const hasSub = Boolean(item.subItems && item.subItems.length > 0);
            const isMenuOpen = openSubmenus[item.label] ?? false;

            return (
              <div key={item.label} className="space-y-1">
                {hasSub ? (
                  <button
                    onClick={() =>
                      setOpenSubmenus((prev) => ({
                        ...prev,
                        [item.label]: !prev[item.label],
                      }))
                    }
                    className={cn(
                      "w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer text-left",
                      isActive
                        ? "bg-blue-600/30 text-white border border-blue-400/30 font-semibold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0",
                        isActive ? "text-sky-400" : "text-slate-400"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-slate-400 transition-transform duration-200",
                        isMenuOpen && "rotate-180 text-slate-200"
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-600/30 text-white border border-blue-400/30 font-semibold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0",
                        isActive ? "text-sky-400" : "text-slate-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                )}

                {/* Submenu Accordion */}
                {hasSub && isMenuOpen && (
                  <div className="pl-6 pr-2 space-y-1">
                    {item.subItems?.map((sub) => {
                      const isSubCurrent = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors",
                            isSubCurrent
                              ? "text-sky-300 font-semibold bg-blue-500/20"
                              : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isSubCurrent ? "bg-sky-400" : "bg-slate-600"
                            )}
                          />
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Drawer Logout */}
        <div className="p-3 border-t border-blue-900/40 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          3. DESKTOP SIDEBAR (lg+ / >= 1024px) — Deep Navy Blue
          ========================================================================= */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-gradient-to-b from-[#0d1e3d] via-[#0a1730] to-[#071022] border-r border-blue-900/40 text-white",
          "transition-all duration-300 ease-in-out shrink-0 select-none z-20 relative shadow-xl",
          isDesktopCollapsed ? "w-[76px]" : "w-64"
        )}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          className={cn(
            "absolute -right-3.5 top-6 z-30",
            "w-7 h-7 rounded-full bg-[#0d1e3d] border border-blue-800/80 text-slate-300 hover:text-white",
            "shadow-md flex items-center justify-center",
            "transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer hover:bg-blue-900"
          )}
          title={isDesktopCollapsed ? "Perluas Menu" : "Kecilkan Menu"}
          aria-label={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isDesktopCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Sidebar Header Logo */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-blue-900/40 px-4 transition-all duration-300 shrink-0",
            isDesktopCollapsed ? "justify-center px-2" : "gap-3"
          )}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-white/10 shrink-0 flex items-center justify-center shadow-sm">
            <Image
              src="/images/Logo.jpg"
              alt="Logo RSUD Dr. M. Yunus"
              width={38}
              height={38}
              className="object-contain rounded-lg"
              priority
            />
          </div>
          {!isDesktopCollapsed && (
            <div className="min-w-0 flex flex-col">
              <span className="text-sm font-bold text-white leading-tight truncate">
                RSUD Dr. M. Yunus
              </span>
              <span className="text-[11px] font-medium text-sky-400 leading-tight truncate">
                SIPINTAR PKRS
              </span>
            </div>
          )}
        </div>

        {/* Desktop Nav Links */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 p-3 scrollbar-none",
            isDesktopCollapsed && "px-2.5"
          )}
        >
          {!isDesktopCollapsed && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-300/60 px-3 py-1">
              Menu Utama
            </p>
          )}

          {navItems.map((item) => {
            const isExactActive = pathname === item.href;
            const isSubActive =
              item.subItems?.some(
                (sub) =>
                  pathname === sub.href || pathname.startsWith(sub.href + "/")
              ) ?? false;
            const isActive = isExactActive || isSubActive;
            const Icon = item.icon;
            const hasSub = Boolean(item.subItems && item.subItems.length > 0);
            const isOpen = openSubmenus[item.label] ?? false;

            if (isDesktopCollapsed) {
              return (
                <div key={item.label} className="relative flex justify-center py-1">
                  <Link
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group relative",
                      isActive
                        ? "bg-blue-600/40 text-sky-300 border border-blue-400/40 font-semibold shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-5 h-5" />
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
                        ? "bg-blue-600/30 text-white border border-blue-400/30 font-semibold shadow-xs"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-colors",
                        isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-slate-400 transition-transform duration-200",
                        isOpen && "rotate-180 text-slate-200"
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-blue-600/30 text-white border border-blue-400/30 font-semibold shadow-xs"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-colors",
                        isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
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
                              ? "text-sky-300 font-semibold bg-blue-500/20"
                              : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all",
                              isSubCurrent ? "bg-sky-400 scale-125" : "bg-slate-600 group-hover:bg-slate-400"
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

        {/* Desktop Bottom Logout */}
        <div
          className={cn(
            "p-3 border-t border-blue-900/40 shrink-0",
            isDesktopCollapsed ? "flex justify-center" : ""
          )}
        >
          <button
            onClick={handleLogout}
            id="btn-logout"
            className={cn(
              "flex items-center gap-3 text-sm font-medium transition-all duration-200 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl group cursor-pointer",
              isDesktopCollapsed
                ? "w-11 h-11 justify-center"
                : "w-full px-3.5 py-2.5"
            )}
            title="Keluar / Logout"
          >
            <LogOut className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-rose-400 transition-colors" />
            {!isDesktopCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          4. MAIN CONTENT AREA (Takes remaining width on Desktop, full width on Mobile)
          ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 pt-14 pb-16 lg:pt-0 lg:pb-0 h-auto lg:h-screen overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      {/* =========================================================================
          5. MOBILE / TABLET BOTTOM NAVIGATION (< lg) — Fixed at bottom
          ========================================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0d1f3d] border-t border-blue-900/50 z-30 shadow-lg flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            item.subItems?.some(
              (sub) =>
                pathname === sub.href || pathname.startsWith(sub.href + "/")
            );
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-semibold transition-colors",
                isActive
                  ? "text-sky-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-sky-400" : "text-slate-400"
                )}
              />
              <span className="truncate max-w-[56px] text-center">
                {item.shortLabel ?? item.label}
              </span>
            </Link>
          );
        })}

        {/* Quick Logout button in bottom nav */}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </nav>
    </div>
  );
}
