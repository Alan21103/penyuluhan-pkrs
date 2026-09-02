import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { Penyuluhan } from "@/types/penyuluhan";

export interface LaporanFilterOptions {
  filterMode: "bulan" | "range";
  bulan?: number; // 0-indexed (0 = Jan, 11 = Des)
  tahun?: number;
  fromDate?: string;
  toDate?: string;
}

export interface LaporanStats {
  totalKegiatan: number;
  totalPeserta: number;
  avgPemahaman: number;
  draftCount: number;
  selesaiCount: number;
}

/**
 * Service Layer untuk Domain Laporan Rekapitulasi.
 * Mengelola query data laporan, filtering, dan kalkulasi ringkasan statistik.
 */
export const laporanService = {
  /**
   * Mengambil semua data penyuluhan untuk rekap laporan
   */
  async getAllForLaporan(): Promise<Penyuluhan[]> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("penyuluhan")
      .select("*")
      .order("hari_tanggal", { ascending: false });

    if (error) {
      console.error("[laporanService.getAllForLaporan] Error:", error.message);
      return [];
    }

    return (data as Penyuluhan[]) ?? [];
  },

  /**
   * Filter data penyuluhan berdasarkan bulan/tahun atau rentang tanggal
   */
  filterData(data: Penyuluhan[], options: LaporanFilterOptions): Penyuluhan[] {
    const { filterMode, bulan, tahun, fromDate, toDate } = options;

    if (filterMode === "bulan" && bulan !== undefined && tahun !== undefined) {
      return data.filter((d) => {
        if (!d.hari_tanggal) return false;
        const dt = new Date(d.hari_tanggal);
        return dt.getMonth() === bulan && dt.getFullYear() === tahun;
      });
    }

    if (filterMode === "range") {
      return data.filter((d) => {
        if (!d.hari_tanggal) return false;
        if (fromDate && d.hari_tanggal < fromDate) return false;
        if (toDate && d.hari_tanggal > toDate) return false;
        return true;
      });
    }

    return data;
  },

  /**
   * Menghitung statistik ringkasan (Total Kegiatan, Total Peserta, Rata-rata Pemahaman)
   */
  calculateStats(data: Penyuluhan[]): LaporanStats {
    const totalKegiatan = data.length;
    const totalPeserta = data.reduce((sum, d) => sum + (d.jumlah_peserta ?? 0), 0);

    const draftCount = data.filter((d) => d.status === "draft").length;
    const selesaiCount = data.filter((d) => d.status === "selesai").length;

    const avgPemahaman =
      totalKegiatan > 0
        ? data.reduce((sum, d) => {
            const pct = d.jumlah_peserta_e > 0 ? (d.jumlah_paham / d.jumlah_peserta_e) * 100 : 0;
            return sum + pct;
          }, 0) / totalKegiatan
        : 0;

    return {
      totalKegiatan,
      totalPeserta,
      avgPemahaman: Math.round(avgPemahaman),
      draftCount,
      selesaiCount,
    };
  },
};
