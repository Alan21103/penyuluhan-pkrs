"use client";

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

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
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-center h-48 text-muted-foreground text-sm">
        Belum ada data untuk ditampilkan dalam grafik
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* Bar chart — Jumlah penyuluhan per bulan */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Jumlah Penyuluhan per Bulan</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe8" vertical={false} />
            <XAxis dataKey="bulan" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e5e7eb" }}
              formatter={(v) => [`${v} kegiatan`, "Penyuluhan"]}
            />
            <Bar dataKey="jumlah_penyuluhan" fill="#3b6fe6" radius={[6, 6, 0, 0]} name="Penyuluhan" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart — Rata-rata pemahaman per bulan */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Rata-rata Pemahaman Peserta (%)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe8" vertical={false} />
            <XAxis dataKey="bulan" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
            <Tooltip
              contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e5e7eb" }}
              formatter={(v) => [`${v}%`, "Rata-rata Pemahaman"]}
            />
            <Line
              type="monotone"
              dataKey="rata_rata_pemahaman"
              stroke="#3b8cd4"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#3b8cd4", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Pemahaman"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
