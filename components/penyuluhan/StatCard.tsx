import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ComponentType } from "react";

type IconComponent = LucideIcon | ComponentType<{ className?: string }>;

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconComponent;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  colorClass?: string;
  id?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  colorClass = "bg-blue-50 text-blue-600 border-blue-100",
  id,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-emerald-600 bg-emerald-50 border-emerald-100"
      : trend === "down"
      ? "text-rose-600 bg-rose-50 border-rose-100"
      : "text-slate-500 bg-slate-50 border-slate-100";

  return (
    <div
      id={id}
      className="relative group transition-transform duration-300 ease-out select-none"
    >
      {/* Stack Layer 3 (Deepest Stack Layer - Darker edge shadow like reference image) */}
      <div 
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-2xl",
          "bg-slate-800/[0.12] dark:bg-black/50",
          "-translate-x-2.5 translate-y-2",
          "border border-slate-400/20 dark:border-slate-800",
          "transition-transform duration-300 ease-out",
          "group-hover:-translate-x-3.5 group-hover:translate-y-3"
        )}
      />

      {/* Stack Layer 2 (Middle Paper Stack Layer) */}
      <div 
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-2xl",
          "bg-blue-50/90 dark:bg-slate-800/80",
          "-translate-x-1.5 translate-y-1",
          "border border-blue-200/60 dark:border-slate-700/60",
          "shadow-xs transition-transform duration-300 ease-out",
          "group-hover:-translate-x-2 group-hover:translate-y-1.5"
        )}
      />

      {/* Main Foreground Card (Top Stack Layer) */}
      <div
        className={cn(
          "relative bg-white dark:bg-slate-900 rounded-2xl",
          "border border-blue-100/90 dark:border-slate-800",
          "p-6 flex flex-col justify-between min-h-[155px]",
          "shadow-[0_4px_20px_-4px_rgba(30,58,138,0.06)]",
          "group-hover:shadow-[0_8px_30px_-4px_rgba(2,132,199,0.12)]",
          "transition-all duration-300 ease-out",
          "group-hover:-translate-y-0.5 overflow-hidden"
        )}
      >
        {/* Subtle Ambient Glow Decoration */}
        <div 
          aria-hidden="true"
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br from-blue-400/10 to-sky-300/5 blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60"
        />

        {/* Top Section: Icon & Optional Trend */}
        <div className="flex items-start justify-between relative z-10">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 shadow-xs",
              colorClass
            )}
          >
            <Icon className="w-5 h-5" />
          </div>

          {trend && trendValue && (
            <div className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border shadow-2xs", trendColor)}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        {/* Bottom Section: Metric Value & Title */}
        <div className="relative z-10 mt-4">
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            {value}
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1.5">
            {title}
          </div>
          {subtitle && (
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Clean Bottom Blue Accent Indicator */}
        <div 
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </div>
  );
}
