// services/export/supervisi-excel.ts
import XLSX from "xlsx-js-style";
import type { SupervisiBulanan } from "@/types/supervisi";

const fmtDate = (d?: string | null) => {
  if (!d) return "-";
  try { return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return d; }
};

const hasilLabel = (k: string) =>
  ({ baik: "Baik", cukup: "Cukup", perlu_perbaikan: "Perlu Perbaikan" }[k] ?? k);

export function generateSupervisiExcel(data: SupervisiBulanan[], fileName?: string) {
  const HEADERS = ["No", "Tanggal", "Unit/Ruang", "Supervisor", "Kepatuhan (%)", "Kategori Hasil", "Kesimpulan", "Status"];
  const COL_WIDTHS = [6, 16, 30, 28, 18, 22, 20, 14];

  const aoa: (string | number)[][] = [
    ["REKAPITULASI SUPERVISI BULANAN PKRS"],
    ["UPTD KHUSUS RSUD Dr. M. YUNUS BENGKULU"],
    [`Instalasi PKRS | Diekspor: ${new Date().toLocaleDateString("id-ID")}`],
    [],
    HEADERS,
  ];

  data.forEach((d, i) => {
    aoa.push([
      i + 1,
      fmtDate(d.tanggal_supervisi),
      d.unit_ruang || "-",
      d.supervisor || "-",
      Number(d.persentase_kepatuhan) || 0,
      hasilLabel(d.hasil_kategori),
      d.kesimpulan === "sesuai" ? "Sesuai" : "Perlu Perbaikan",
      d.status === "selesai" ? "Selesai" : "Draft",
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const HEADER_ROW = 5;
  const FIRST_DATA_ROW = HEADER_ROW + 1;
  const lastColLetter = XLSX.utils.encode_col(HEADERS.length - 1);

  // Merge title rows
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: HEADERS.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: HEADERS.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: HEADERS.length - 1 } },
  ];

  // Title styles
  const titleStyle = { font: { bold: true, sz: 13 }, alignment: { horizontal: "center" } };
  ["A1", "A2"].forEach((cell) => { if (ws[cell]) ws[cell].s = titleStyle; });
  if (ws["A3"]) ws["A3"].s = { font: { sz: 10, italic: true }, alignment: { horizontal: "center" } };

  // Header row styles
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
    fill: { fgColor: { rgb: "1E40AF" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } },
  };
  HEADERS.forEach((_, ci) => {
    const cell = XLSX.utils.encode_cell({ r: HEADER_ROW - 1, c: ci });
    if (ws[cell]) ws[cell].s = headerStyle;
  });

  // Data rows
  for (let r = FIRST_DATA_ROW - 1; r < aoa.length; r++) {
    for (let c = 0; c < HEADERS.length; c++) {
      const cell = XLSX.utils.encode_cell({ r, c });
      if (!ws[cell]) continue;
      ws[cell].s = {
        font: { sz: 9 },
        alignment: { horizontal: c === 0 ? "center" : "left", vertical: "center", wrapText: true },
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } },
      };
    }
  }

  ws["!cols"] = COL_WIDTHS.map((w) => ({ wpx: w * 7 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Supervisi Bulanan");
  XLSX.writeFile(wb, fileName ?? `Rekap_Supervisi_${new Date().getFullYear()}.xlsx`);
}
