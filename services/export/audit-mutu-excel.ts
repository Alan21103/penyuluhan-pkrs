// services/export/audit-mutu-excel.ts
import XLSX from "xlsx-js-style";
import type { AuditMutu } from "@/types/audit-mutu";

const fmtDate = (d?: string | null) => {
  if (!d) return "-";
  try { return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return d; }
};

const pct = (sesuai: number, sampel: number) =>
  sampel > 0 ? `${((sesuai / sampel) * 100).toFixed(1)}%` : "-";

export function generateAuditMutuExcel(data: AuditMutu[], fileName?: string) {
  const INDIKATOR_LABELS = [
    "Pengkajian Kebutuhan Edukasi",
    "Edukasi Sesuai Kebutuhan",
    "Media KIE Diberikan",
    "Kepatuhan PPA Form Edukasi",
    "Media Edukasi Sesuai Asesmen",
    "Media 10 Penyakit Terbanyak",
    "Kunjungan Instagram",
    "Kunjungan YouTube",
  ];

  const HEADERS = [
    "No", "Tanggal", "Periode", "Unit/Ruangan", "Auditor",
    ...INDIKATOR_LABELS.map((l) => `${l} (%)`),
    "Status",
  ];

  const aoa: (string | number)[][] = [
    ["REKAPITULASI AUDIT INDIKATOR MUTU PKRS"],
    ["UPTD KHUSUS RSUD Dr. M. YUNUS BENGKULU"],
    [`Instalasi PKRS | Diekspor: ${new Date().toLocaleDateString("id-ID")}`],
    [],
    HEADERS,
  ];

  data.forEach((d, i) => {
    const capaians = Array.from({ length: 8 }, (_, idx) => {
      const item = d.checklist_audit[idx];
      if (!item) return "-";
      return pct(item.jumlah_sesuai, item.jumlah_sampel);
    });
    aoa.push([
      i + 1,
      fmtDate(d.tanggal_audit),
      d.periode_audit || "-",
      d.unit_ruangan || "-",
      d.auditor || "-",
      ...capaians,
      d.status === "selesai" ? "Selesai" : "Draft",
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const HEADER_ROW = 5;
  const FIRST_DATA_ROW = HEADER_ROW + 1;
  const lastColIdx = HEADERS.length - 1;

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastColIdx } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastColIdx } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: lastColIdx } },
  ];

  const titleStyle = { font: { bold: true, sz: 13 }, alignment: { horizontal: "center" } };
  ["A1", "A2"].forEach((cell) => { if (ws[cell]) ws[cell].s = titleStyle; });

  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 9 },
    fill: { fgColor: { rgb: "1E40AF" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } },
  };
  HEADERS.forEach((_, ci) => {
    const cell = XLSX.utils.encode_cell({ r: HEADER_ROW - 1, c: ci });
    if (ws[cell]) ws[cell].s = headerStyle;
  });

  for (let r = FIRST_DATA_ROW - 1; r < aoa.length; r++) {
    for (let c = 0; c <= lastColIdx; c++) {
      const cell = XLSX.utils.encode_cell({ r, c });
      if (!ws[cell]) continue;
      ws[cell].s = {
        font: { sz: 9 },
        alignment: { horizontal: c === 0 ? "center" : "left", vertical: "center", wrapText: true },
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } },
      };
    }
  }

  ws["!cols"] = [7, 14, 14, 24, 22, ...Array(8).fill(18), 12].map((w) => ({ wpx: w * 6 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Audit Mutu");
  XLSX.writeFile(wb, fileName ?? `Rekap_AuditMutu_${new Date().getFullYear()}.xlsx`);
}
