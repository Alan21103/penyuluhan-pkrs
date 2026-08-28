"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface ChartData {
  bulan: string;
  jumlah_penyuluhan: number;
  rata_rata_pemahaman: number;
}

interface DashboardChartsProps {
  data: ChartData[];
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center h-56 text-slate-400 text-sm shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
        <span>Belum ada data untuk ditampilkan dalam grafik</span>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  // Custom Tooltip for Penyuluhan
  const CustomPenyuluhanTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 px-3.5 py-2.5 rounded-xl shadow-lg shadow-blue-500/5 text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#6888ff]" />
            <span className="text-slate-500 dark:text-slate-400">Penyuluhan:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {payload[0].value} Kegiatan
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Pemahaman
  const CustomPemahamanTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 px-3.5 py-2.5 rounded-xl shadow-lg shadow-blue-500/5 text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" />
            <span className="text-slate-500 dark:text-slate-400">Pemahaman:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {payload[0].value}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Card 1: Jumlah Penyuluhan per Bulan */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
        {/* Header with Title Tab & Horizontal Divider */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between pb-3">
            <div className="relative pb-1">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Jumlah Penyuluhan
              </span>
              <span className="absolute bottom-[-13px] left-0 right-0 h-[3px] bg-blue-500 rounded-full z-10" />
            </div>
          </div>
          <div className="w-full h-[1px] bg-slate-200/80 dark:bg-slate-800" />
        </div>

        {/* Chart 1 Area */}
        <div className="w-full h-[260px] sm:h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 15, right: 10, bottom: 5, left: -15 }}
            >
              <defs>
                <linearGradient id="barBlueGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7a9bfd" />
                  <stop offset="100%" stopColor="#6888ff" />
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
              <Tooltip content={<CustomPenyuluhanTooltip />} cursor={{ fill: "#f1f5f9", opacity: 0.5 }} />
              <Bar
                dataKey="jumlah_penyuluhan"
                fill="url(#barBlueGradient1)"
                radius={[4, 4, 0, 0]}
                maxBarSize={44}
                name="Jumlah Penyuluhan"
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Legend */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#6888ff]" />
          <span>{currentYear} — Kegiatan Penyuluhan</span>
        </div>
      </div>

      {/* Card 2: Rata-rata Pemahaman Peserta (%) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
        {/* Header with Title Tab & Horizontal Divider */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between pb-3">
            <div className="relative pb-1">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Rata-rata Pemahaman Peserta
              </span>
              <span className="absolute bottom-[-13px] left-0 right-0 h-[3px] bg-sky-500 rounded-full z-10" />
            </div>
          </div>
          <div className="w-full h-[1px] bg-slate-200/80 dark:bg-slate-800" />
        </div>

        {/* Chart 2 Area */}
        <div className="w-full h-[260px] sm:h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 15, right: 10, bottom: 5, left: -15 }}
            >
              <defs>
                <linearGradient id="barCyanGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
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
                domain={[0, 100]}
                unit="%"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                dx={-4}
              />
              <Tooltip content={<CustomPemahamanTooltip />} cursor={{ fill: "#f1f5f9", opacity: 0.5 }} />
              <Bar
                dataKey="rata_rata_pemahaman"
                fill="url(#barCyanGradient2)"
                radius={[4, 4, 0, 0]}
                maxBarSize={44}
                name="Tingkat Pemahaman"
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Legend */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" />
          <span>{currentYear} — Rata-rata Pemahaman (%)</span>
        </div>
      </div>
    </div>
  );
}
