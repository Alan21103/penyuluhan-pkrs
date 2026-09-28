import XLSX from "xlsx-js-style";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";

export function generateMediaEdukasiExcel(data: LaporanMediaEdukasi[], filename: string) {
  const HEADERS = [
    "No",
    "Periode/Bulan",
    "Tahun",
    "Penanggung Jawab",
    "Petugas Pelaporan",
    "Jumlah Media",
    "Total Distribusi",
    "Status"
  ];
  const COL_WIDTHS = [6, 16, 12, 25, 25, 15, 20, 14];

  const aoa: (string | number | { f: string })[][] = [
    ["REKAPITULASI LAPORAN BULANAN MEDIA EDUKASI PKRS"],
    ["RSUD dr. M. YUNUS BENGKULU"],
    [`Diekspor: ${new Date().toLocaleDateString("id-ID")}`],
    [],
    HEADERS,
  ];

  data.forEach((d, i) => {
    const jumlahMedia = d.items?.length || 0;
    const totalDistribusi = (d.items || []).reduce((sum, item) => sum + (Number(item.jumlah_distribusi) || 0), 0);
    
    aoa.push([
      i + 1,
      d.periode_bulan || "-",
      d.tahun || "-",
      d.penanggung_jawab || "-",
      d.petugas_pelaporan || "-",
      jumlahMedia,
      totalDistribusi,
      d.status === "selesai" ? "Selesai" : "Draft",
    ]);
  });
  
  // Footer row for Totals
  const lastDataRowIdx = aoa.length;
  if (data.length > 0) {
    const firstDataRow = 6; // 1-indexed, starts after 5 header rows
    aoa.push([
      "TOTAL",
      "-",
      "-",
      "-",
      "-",
      { f: `SUM(F${firstDataRow}:F${lastDataRowIdx})` },
      { f: `SUM(G${firstDataRow}:G${lastDataRowIdx})` },
      "-"
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const HEADER_ROW = 5;
  const FIRST_DATA_ROW = HEADER_ROW + 1;

  // Merge title rows
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: HEADERS.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: HEADERS.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: HEADERS.length - 1 } },
  ];
  
  // Merge TOTAL row (last row, columns 0-4)
  if (data.length > 0) {
    ws["!merges"].push({
      s: { r: lastDataRowIdx, c: 0 },
      e: { r: lastDataRowIdx, c: 4 }
    });
  }

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

  // Data rows and Total row
  for (let r = FIRST_DATA_ROW - 1; r < aoa.length; r++) {
    const isTotalRow = r === aoa.length - 1 && data.length > 0;
    for (let c = 0; c < HEADERS.length; c++) {
      const cell = XLSX.utils.encode_cell({ r, c });
      if (!ws[cell]) continue;
      
      const bgColor = (r - FIRST_DATA_ROW) % 2 === 0 && !isTotalRow ? { rgb: "F3F4F6" } : { rgb: "FFFFFF" };
      const rowFill = isTotalRow ? { fgColor: { rgb: "E5E7EB" } } : { fgColor: bgColor };
      
      let alignH = c === 0 ? "center" : "left";
      if (isTotalRow && c === 0) alignH = "center";
      
      ws[cell].s = {
        font: { sz: 9, bold: isTotalRow },
        fill: rowFill,
        alignment: { horizontal: alignH, vertical: "center", wrapText: true },
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } },
      };
    }
  }

  ws["!cols"] = COL_WIDTHS.map((w) => ({ wpx: w * 7 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Media Edukasi");
  XLSX.writeFile(wb, filename);
}
