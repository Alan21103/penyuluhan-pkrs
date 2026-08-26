import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
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
  colorClass = "bg-primary/10 text-primary",
  id,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
      ? "text-red-500"
      : "text-muted-foreground";

  return (
    <div
      id={id}
      className={cn(
        "relative bg-card rounded-2xl border border-border p-6 flex flex-col gap-4",
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        "overflow-hidden group"
      )}
    >
      {/* Background decoration */}
      <div
        className={cn(
          "absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-[0.06] blur-xl transition-opacity group-hover:opacity-10",
          colorClass.split(" ")[0]
        )}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
            colorClass
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        {trend && trendValue && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-sm font-medium text-foreground/80 mt-0.5">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
