"use client";

import { Bell, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  userEmail?: string;
}

export default function Header({ title, userEmail }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border shrink-0">
      {/* Judul Halaman */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      {/* Kanan: notif + user */}
      <div className="flex items-center gap-2">
        {/* Notifikasi */}
        <Button
          variant="ghost"
          size="icon"
          className="relative w-9 h-9 rounded-xl"
          id="btn-notifikasi"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
        </Button>

        {/* User Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          {userEmail && (
            <span className="text-sm text-muted-foreground hidden sm:block max-w-[180px] truncate">
              {userEmail}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
