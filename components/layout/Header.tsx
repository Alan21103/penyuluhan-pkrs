"use client";

import { Bell, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  userEmail?: string;
  userRole?: string;
}

export default function Header({
  title,
  userEmail,
  userRole = "Administrator PKRS",
}: HeaderProps) {
  // Initials from email prefix e.g. "adminpkrs21@gmail.com" -> "AP"
  const initials = userEmail
    ? userEmail.split("@")[0].slice(0, 2).toUpperCase()
    : "AP";

  return (
    <header className="hidden lg:flex h-16 items-center justify-between px-6 bg-card border-b border-border shrink-0">
      {/* Judul Halaman */}
      <div>
        <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
          {title}
        </h1>
      </div>

      {/* Kanan: notif + user */}
      <div className="flex items-center gap-3">
        {/* Notifikasi dengan red badge */}
        <Button
          variant="ghost"
          size="icon"
          className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          id="btn-notifikasi"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-card" />
        </Button>

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-border/70 ml-1">
          <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {initials}
          </div>
          {userEmail && (
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[180px]">
                {userEmail}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                {userRole}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
