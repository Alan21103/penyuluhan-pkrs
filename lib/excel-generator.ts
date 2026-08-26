import * as XLSX from "xlsx";
import type { Penyuluhan } from "@/types/penyuluhan";

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-";

const pct = (paham: number, total: number) =>
  total > 0 ? `${Math.round((paham / total) * 100)}%` : "0%";

export function generateExcel(data: Penyuluhan[], fileName?: string) {
  const rows = data.map((d, i) => ({
    No: i + 1,
    "Hari/Tanggal": fmtDate(d.hari_tanggal),
    Waktu: `${d.waktu_mulai || "-"} – ${d.waktu_selesai || "-"}`,
    Tempat: d.tempat,
    Topik: d.topik,
    Sasaran: d.sasaran,
    "Jumlah Peserta": d.jumlah_peserta,
    Penyuluh: (d.penyuluh ?? []).join(", "),
    "Unit/Instansi": d.unit_instansi,
    Metode: (d.metode ?? []).join(", "),
    "Persentase Pemahaman": pct(d.jumlah_paham, d.jumlah_peserta_e),
    Status: d.status === "selesai" ? "Selesai" : "Draft",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Lebar kolom
  ws["!cols"] = [
    { wch: 5 },   // No
    { wch: 14 },  // Tanggal
    { wch: 14 },  // Waktu
    { wch: 24 },  // Tempat
    { wch: 36 },  // Topik
    { wch: 20 },  // Sasaran
    { wch: 14 },  // Peserta
    { wch: 28 },  // Penyuluh
    { wch: 20 },  // Unit
    { wch: 24 },  // Metode
    { wch: 20 },  // Pemahaman
    { wch: 14 },  // Status
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rekap Penyuluhan");

  // Sheet info
  const infoWs = XLSX.utils.aoa_to_sheet([
    ["REKAP KEGIATAN PENYULUHAN KELOMPOK PKRS"],
    ["UPTD KHUSUS RSUD Dr. M. Yunus Bengkulu"],
    [],
    [`Dicetak pada: ${new Date().toLocaleString("id-ID")}`],
    [`Total Data: ${data.length} kegiatan`],
  ]);
  XLSX.utils.book_append_sheet(wb, infoWs, "Info");

  const name = fileName || `Rekap_PKRS_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}
