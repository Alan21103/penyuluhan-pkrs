import React from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  accentColor?: string;
  badgeText?: string;
  badgeClass?: string;
  children: React.ReactNode;
  legendText?: string;
  legendColor?: string;
  className?: string;
}

export default function ChartCard({
  title,
  accentColor = "bg-blue-500",
  badgeText,
  badgeClass = "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
  children,
  legendText,
  legendColor = "bg-[#6888ff]",
  className,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between",
        className
      )}
    >
      {/* Header with Title Tab & Horizontal Divider */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between pb-3">
          <div className="relative pb-1">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {title}
            </span>
            <span
              className={cn(
                "absolute bottom-[-13px] left-0 right-0 h-[3px] rounded-full z-10",
                accentColor
              )}
            />
          </div>
          {badgeText && (
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full border",
                badgeClass
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
        <div className="w-full h-[1px] bg-slate-200/80 dark:bg-slate-800" />
      </div>

      {/* Main Chart Body */}
      {children}

      {/* Bottom Legend */}
      {legendText && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className={cn("w-2.5 h-2.5 rounded-xs shrink-0", legendColor)} />
          <span>{legendText}</span>
        </div>
      )}
    </div>
  );
}
