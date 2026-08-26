"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  ClipboardList,
  FileSpreadsheet,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Data Penyuluhan",
    href: "/penyuluhan",
    icon: ClipboardList,
  },
  {
    label: "Laporan",
    href: "/laporan",
    icon: FileSpreadsheet,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex flex-col h-full w-64 bg-sidebar text-sidebar-foreground">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-white/10 flex items-center justify-center">
          <Image
            src="/images/Logo.jpg"
            alt="Logo RSUD Dr. M. Yunus"
            width={38}
            height={38}
            className="object-contain rounded-lg"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-sidebar-foreground leading-tight truncate">
            RSUD Dr. M. Yunus
          </p>
          <p className="text-[10px] text-sidebar-foreground/50 leading-tight">
            Sistem PKRS Bengkulu
          </p>
        </div>
      </div>


      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-2">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-4.5 h-4.5 shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-foreground"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-sidebar-foreground/40" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left text-sidebar-foreground/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 group"
          id="btn-logout"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0 text-sidebar-foreground/50 group-hover:text-red-400 transition-colors" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
