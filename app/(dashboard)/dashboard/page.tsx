import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import StatCard from "@/components/penyuluhan/StatCard";
import DashboardCharts from "@/components/penyuluhan/DashboardCharts";
import {
  ClipboardList, Users, Brain, CalendarDays,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data: penyuluhanBulanIni } = await supabase
    .from("penyuluhan")
    .select("jumlah_peserta, jumlah_paham, jumlah_peserta_e")
    .gte("hari_tanggal", firstOfMonth)
    .lte("hari_tanggal", lastOfMonth);

  const totalBulanIni = penyuluhanBulanIni?.length ?? 0;
  const totalPeserta = penyuluhanBulanIni?.reduce((a, p) => a + (p.jumlah_peserta ?? 0), 0) ?? 0;
  const avgPemahaman =
    penyuluhanBulanIni && penyuluhanBulanIni.length > 0
      ? penyuluhanBulanIni.reduce((a, p) => {
          return a + (p.jumlah_peserta_e > 0 ? (p.jumlah_paham / p.jumlah_peserta_e) * 100 : 0);
        }, 0) / penyuluhanBulanIni.length
      : 0;

  const { count: totalSemua } = await supabase
    .from("penyuluhan")
    .select("*", { count: "exact", head: true });

  // Data chart — 6 bulan terakhir
  const { data: chartRaw } = await supabase
    .from("v_statistik_dashboard").select("*").limit(12);

  const chartData = (chartRaw ?? []).map((r: any) => ({
    bulan: new Date(r.bulan).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
    jumlah_penyuluhan: Number(r.jumlah_penyuluhan),
    rata_rata_pemahaman: Number(r.rata_rata_pemahaman),
  })).reverse();

  const bulanNama = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Dashboard" userEmail={user?.email} />
      <main className="flex-1 p-6 space-y-6">
        {/* Sambutan */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Selamat datang</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ringkasan kegiatan penyuluhan PKRS bulan{" "}
              <span className="font-medium text-foreground">{bulanNama}</span>
            </p>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard id="stat-penyuluhan-bulan-ini" title="Penyuluhan Bulan Ini" value={totalBulanIni}
            subtitle={bulanNama} icon={ClipboardList} colorClass="bg-primary/10 text-primary" trend="neutral" />
          <StatCard id="stat-total-peserta" title="Total Peserta" value={totalPeserta.toLocaleString("id-ID")}
            subtitle="Bulan ini" icon={Users} colorClass="bg-emerald-100 text-emerald-700" trend="up" trendValue="+12%" />
          <StatCard id="stat-rata-pemahaman" title="Rata-rata Pemahaman" value={`${avgPemahaman.toFixed(1)}%`}
            subtitle="Berdasarkan verifikasi" icon={Brain} colorClass="bg-blue-100 text-blue-700"
            trend={avgPemahaman >= 70 ? "up" : "down"} trendValue={avgPemahaman >= 70 ? "Baik" : "Perlu Perhatian"} />
          <StatCard id="stat-total-kegiatan" title="Total Kegiatan" value={totalSemua ?? 0}
            subtitle="Semua waktu" icon={CalendarDays} colorClass="bg-violet-100 text-violet-700" trend="neutral" />
        </div>

        {/* Charts */}
        <DashboardCharts data={chartData} />

        {/* Empty state */}
        {totalBulanIni === 0 && chartData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 bg-card border border-dashed border-border rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <ClipboardList className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Belum ada data penyuluhan</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Mulai tambahkan data kegiatan penyuluhan kelompok PKRS dari menu Data Penyuluhan.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
