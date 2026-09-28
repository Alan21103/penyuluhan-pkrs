"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Loader2 } from "lucide-react";
import { mediaEdukasiService } from "@/services/media-edukasi.service";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";
import { BULAN_SHORT_MAP, BULAN_ORDER } from "@/constants/date";
import ChartCard from "@/components/charts/ChartCard";

interface TrendDataPoint {
  bulan: string;
  bulanSort: string;
  jumlah_media: number;
  total_distribusi: number;
}

function aggregateData(data: LaporanMediaEdukasi[]): TrendDataPoint[] {
  const map = new Map<
    string,
    { jumlah_media: number; total_distribusi: number; tahun: string; bulanFull: string }
  >();

  data.forEach((d) => {
    const key = `${d.periode_bulan}_${d.tahun}`;
    const existing = map.get(key);
    const itemCount = d.items?.length ?? 0;
    const distTotal = (d.items ?? []).reduce(
      (sum, item) => sum + (Number(item.jumlah_distribusi) || 0),
      0
    );

    if (existing) {
      existing.jumlah_media += itemCount;
      existing.total_distribusi += distTotal;
    } else {
      map.set(key, {
        jumlah_media: itemCount,
        total_distribusi: distTotal,
        tahun: d.tahun,
        bulanFull: d.periode_bulan,
      });
    }
  });

  return Array.from(map.entries())
    .map(([, val]) => {
      const shortMonth = BULAN_SHORT_MAP[val.bulanFull] ?? val.bulanFull.substring(0, 3);
      const shortYear = val.tahun.slice(-2);
      return {
        bulan: `${shortMonth} '${shortYear}`,
        bulanSort: `${val.tahun}-${String(BULAN_ORDER[val.bulanFull] ?? 0).padStart(2, "0")}`,
        jumlah_media: val.jumlah_media,
        total_distribusi: val.total_distribusi,
      };
    })
    .sort((a, b) => a.bulanSort.localeCompare(b.bulanSort));
}

export default function MediaEdukasiTrendChart() {
  const [data, setData] = useState<LaporanMediaEdukasi[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await mediaEdukasiService.getAll();
      setData(result || []);
    } catch (error) {
      console.error("Failed to load trend data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = useMemo(() => aggregateData(data), [data]);
  const currentYear = new Date().getFullYear();

  // Summary counts for badges
  const totalMediaAll = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.jumlah_media, 0),
    [chartData]
  );
  const totalDistribusiAll = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.total_distribusi, 0),
    [chartData]
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 flex items-center justify-center h-56 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="text-sm font-medium">Memuat grafik tren...</span>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center h-56 text-slate-400 text-sm shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
        <span>Belum ada data untuk ditampilkan dalam grafik tren</span>
      </div>
    );
  }

  // Custom Tooltip 1: Jumlah Media (Blue Theme)
  const CustomMediaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 px-3.5 py-2.5 rounded-xl shadow-lg shadow-blue-500/5 text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#6888ff]" />
            <span className="text-slate-500 dark:text-slate-400">Jumlah Media:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {payload[0].value.toLocaleString("id-ID")} Media
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip 2: Total Distribusi (Sky Theme)
  const CustomDistribusiTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 px-3.5 py-2.5 rounded-xl shadow-lg shadow-blue-500/5 text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" />
            <span className="text-slate-500 dark:text-slate-400">Total Distribusi:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {payload[0].value.toLocaleString("id-ID")} Eks / Tayangan
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      {/* Card 1: Tren Jumlah Media Edukasi (Tema Blue Dashboard) */}
      <ChartCard
        title="Tren Jumlah Media Edukasi"
        accentColor="bg-blue-500"
        badgeText={`Total ${totalMediaAll.toLocaleString("id-ID")} Media`}
        badgeClass="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50"
        legendText={`${currentYear} — Jumlah Media per Bulan`}
        legendColor="bg-[#6888ff]"
      >
        <div className="w-full h-[260px] sm:h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 15, right: 10, bottom: 5, left: -15 }}
            >
              <defs>
                <linearGradient id="mediaBlueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7a9bfd" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6888ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={true}
                strokeOpacity={0.8}
              />
              <XAxis
                dataKey="bulan"
                axisLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                dx={-4}
              />
              <Tooltip
                content={<CustomMediaTooltip />}
                cursor={{ stroke: "#6888ff", strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="jumlah_media"
                stroke="#6888ff"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#mediaBlueGradient)"
                dot={{ r: 4, fill: "#6888ff", stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#4361ee", stroke: "#ffffff", strokeWidth: 2.5 }}
                name="Jumlah Media"
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Card 2: Tren Total Distribusi / Tayangan (Tema Sky Dashboard) */}
      <ChartCard
        title="Tren Distribusi & Tayangan"
        accentColor="bg-sky-500"
        badgeText={`Total ${totalDistribusiAll.toLocaleString("id-ID")} Distribusi`}
        badgeClass="bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/50"
        legendText={`${currentYear} — Total Distribusi / Tayangan per Bulan`}
        legendColor="bg-sky-500"
      >
        <div className="w-full h-[260px] sm:h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 15, right: 10, bottom: 5, left: -15 }}
            >
              <defs>
                <linearGradient id="mediaSkyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={true}
                strokeOpacity={0.8}
              />
              <XAxis
                dataKey="bulan"
                axisLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                dx={-4}
              />
              <Tooltip
                content={<CustomDistribusiTooltip />}
                cursor={{ stroke: "#0284c7", strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="total_distribusi"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#mediaSkyGradient)"
                dot={{ r: 4, fill: "#0284c7", stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#0369a1", stroke: "#ffffff", strokeWidth: 2.5 }}
                name="Total Distribusi"
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
