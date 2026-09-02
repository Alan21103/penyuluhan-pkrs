import XLSX from "xlsx-js-style";
import type { Penyuluhan } from "@/types/penyuluhan";

const fmtDate = (d: string) => {
  if (!d) return "-";
  try {
    const date = new Date(d);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const HEADERS = [
  "No",
  "Hari/Tanggal",
  "Waktu",
  "Tempat",
  "Topik",
  "Sasaran",
  "Jumlah Peserta",
  "Penyuluh",
  "Unit / Instansi",
  "Metode",
  "Persentase Pemahaman",
  "Status",
];

const COL_WIDTHS = [6, 16, 16, 26, 38, 22, 16, 30, 24, 26, 24, 14];

export function generateExcel(data: Penyuluhan[], fileName?: string) {
  const HEADER_ROW = 5; // Baris ke-5 adalah table header (1-indexed)
  const FIRST_DATA_ROW = HEADER_ROW + 1;
  const lastColIdx = HEADERS.length - 1;
  const lastColLetter = XLSX.utils.encode_col(lastColIdx);

  // ── 1. Susun Baris Data AOA ─────────────────────────────────────────────
  const aoa: (string | number)[][] = [
    ["REKAPITULASI KEGIATAN PENYULUHAN KELOMPOK PKRS"],
    ["UPTD KHUSUS RSUD Dr. M. YUNUS BENGKULU"],
    [`Instalasi PKRS | Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`],
    [], // Baris kosong pemisah
    HEADERS,
  ];

  data.forEach((d, i) => {
    const totalE = d.jumlah_peserta_e || 0;
    const paham = d.jumlah_paham || 0;
    const pctValue = totalE > 0 ? paham / totalE : 0;

    aoa.push([
      i + 1,
      fmtDate(d.hari_tanggal),
      d.waktu_mulai && d.waktu_selesai
        ? `${d.waktu_mulai} – ${d.waktu_selesai}`
        : d.waktu_mulai || "-",
      d.tempat || "-",
      d.topik || "-",
      d.sasaran || "-",
      d.jumlah_peserta ?? 0,
      (d.penyuluh ?? []).join(", ") || "-",
      d.unit_instansi || "-",
      (d.metode ?? []).join(", ") || "-",
      pctValue,
      d.status === "selesai" ? "Selesai" : "Draft",
    ]);
  });

  const lastDataRow = data.length > 0 ? FIRST_DATA_ROW + data.length - 1 : FIRST_DATA_ROW;
  const totalRow = data.length > 0 ? lastDataRow + 1 : FIRST_DATA_ROW + 1;

  if (data.length > 0) {
    aoa.push(["", "", "", "", "", "TOTAL / RATA-RATA", "", "", "", "", "", ""]);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // ── 2. Style Reusable Sesuai Template (E2E8F0 Header & Size 12 Bold) ────
  const thinBorder = {
    top: { style: "thin", color: { rgb: "CBD5E1" } },
    bottom: { style: "thin", color: { rgb: "CBD5E1" } },
    left: { style: "thin", color: { rgb: "CBD5E1" } },
    right: { style: "thin", color: { rgb: "CBD5E1" } },
  };

  const headerBorder = {
    top: { style: "medium", color: { rgb: "94A3B8" } },
    bottom: { style: "medium", color: { rgb: "94A3B8" } },
    left: { style: "thin", color: { rgb: "CBD5E1" } },
    right: { style: "thin", color: { rgb: "CBD5E1" } },
  };

  // Header Title Style
  const styleMainTitle = {
    font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "0F172A" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  const styleSubTitle = {
    font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "475569" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  const styleMetaTitle = {
    font: { name: "Calibri", sz: 9, italic: true, color: { rgb: "64748B" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  // Table Column Header Style (Sesuai PHP Template: fill E2E8F0, font bold size 12)
  const styleColHeader = {
    fill: {
      fgColor: { rgb: "E2E8F0" },
    },
    font: {
      name: "Calibri",
      sz: 12,
      bold: true,
      color: { rgb: "1E293B" },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
    border: headerBorder,
  };

  // Terapkan Title Styling
  if (ws["A1"]) ws["A1"].s = styleMainTitle;
  if (ws["A2"]) ws["A2"].s = styleSubTitle;
  if (ws["A3"]) ws["A3"].s = styleMetaTitle;

  // Terapkan Table Header Styling (Baris 5)
  for (let c = 0; c <= lastColIdx; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: HEADER_ROW - 1, c });
    if (ws[cellRef]) {
      ws[cellRef].s = styleColHeader;
    }
  }

  // ── 3. Style Baris Data ────────────────────────────────────────────────
  const rowHeights: { hpt: number }[] = [
    { hpt: 26 }, // Baris 1: Judul
    { hpt: 20 }, // Baris 2: Subjudul
    { hpt: 18 }, // Baris 3: Tanggal
    { hpt: 10 }, // Baris 4: Spasi
    { hpt: 28 }, // Baris 5: Header Kolom (size 12)
  ];

  data.forEach((d, idx) => {
    const r = FIRST_DATA_ROW - 1 + idx;
    const isEven = idx % 2 === 0;
    const bgRgb = isEven ? "FFFFFF" : "F8FAFC"; // Alternating row color

    rowHeights.push({ hpt: 22 });

    for (let c = 0; c <= lastColIdx; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (!cell) continue;

      let horizontalAlign: "left" | "center" | "right" = "left";
      let isBold = false;
      let fontColor = "1E293B";
      let customFill = bgRgb;

      if (c === 0 || c === 1 || c === 2) {
        // No, Hari/Tanggal, Waktu
        horizontalAlign = "center";
      } else if (c === 4) {
        // Topik
        isBold = true;
        fontColor = "0F172A";
      } else if (c === 6) {
        // Jumlah Peserta
        horizontalAlign = "center";
        cell.z = "#,##0";
      } else if (c === 10) {
        // Persentase Pemahaman
        horizontalAlign = "center";
        isBold = true;
        fontColor = "0F766E";
        cell.z = "0.0%";
      } else if (c === 11) {
        // Status Badge
        horizontalAlign = "center";
        isBold = true;
        if (d.status === "selesai") {
          fontColor = "047857";
          customFill = "DCFCE7";
        } else {
          fontColor = "B45309";
          customFill = "FEF3C7";
        }
      }

      cell.s = {
        fill: { fgColor: { rgb: customFill } },
        font: {
          name: "Calibri",
          sz: 11,
          bold: isBold,
          color: { rgb: fontColor },
        },
        alignment: {
          vertical: "center",
          horizontal: horizontalAlign,
          wrapText: c === 4 || c === 7 || c === 9,
        },
        border: thinBorder,
      };
    }
  });

  // ── 4. Baris Total / Rata-rata ──────────────────────────────────────────
  if (data.length > 0) {
    rowHeights.push({ hpt: 24 });
    const rTotal = totalRow - 1;

    // Formula Total Peserta (Kolom G) dan Rata-rata Pemahaman (Kolom K)
    ws[`G${totalRow}`] = {
      t: "n",
      f: `SUM(G${FIRST_DATA_ROW}:G${lastDataRow})`,
      z: "#,##0",
    };

    ws[`K${totalRow}`] = {
      t: "n",
      f: `AVERAGE(K${FIRST_DATA_ROW}:K${lastDataRow})`,
      z: "0.0%",
    };

    const summaryBorder = {
      top: { style: "medium", color: { rgb: "94A3B8" } },
      bottom: { style: "double", color: { rgb: "94A3B8" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } },
    };

    for (let c = 0; c <= lastColIdx; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: rTotal, c });
      if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };

      const cell = ws[cellRef];
      let align: "left" | "center" | "right" = "center";
      if (c <= 5) align = "right";

      cell.s = {
        fill: { fgColor: { rgb: "E2E8F0" } },
        font: {
          name: "Calibri",
          sz: 11,
          bold: true,
          color: { rgb: "1E293B" },
        },
        alignment: { vertical: "center", horizontal: align },
        border: summaryBorder,
      };
    }
  }

  // ── 5. Setup Merges & Row/Column Properties ─────────────────────────────
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastColIdx } }, // Judul Utama
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastColIdx } }, // Subjudul RS
    { s: { r: 2, c: 0 }, e: { r: 2, c: lastColIdx } }, // Metadata Tanggal
  ];

  if (data.length > 0) {
    merges.push({
      s: { r: totalRow - 1, c: 0 },
      e: { r: totalRow - 1, c: 5 },
    }); // Merge label "TOTAL / RATA-RATA" (Kolom A-F)
  }

  ws["!merges"] = merges;
  ws["!cols"] = COL_WIDTHS.map((wch) => ({ wch }));
  ws["!rows"] = rowHeights;

  // Auto filter pada baris header table
  if (data.length > 0) {
    ws["!autofilter"] = { ref: `A${HEADER_ROW}:${lastColLetter}${lastDataRow}` };
  }

  // ── 6. Buat Workbook & Tambahkan Sheet ──────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rekap Penyuluhan");

  // ── 7. Sheet Info Tambahan (Metadata Dokumen) ───────────────────────────
  const infoAoa = [
    ["INFORMASI DOKUMEN REKAPITULASI"],
    [],
    ["Instansi", "UPTD Khusus RSUD Dr. M. Yunus Bengkulu"],
    ["Unit Kerja", "Instalasi PKRS (Promosi Kesehatan Rumah Sakit)"],
    ["Judul Laporan", "Rekapitulasi Pelaksanaan Kegiatan Penyuluhan"],
    ["Waktu Ekspor", new Date().toLocaleString("id-ID")],
    ["Jumlah Kegiatan", `${data.length} kegiatan penyuluhan`],
    ["Status Kegiatan", `${data.filter((x) => x.status === "selesai").length} Selesai, ${data.filter((x) => x.status !== "selesai").length} Draft`],
    ["Total Peserta", data.reduce((acc, curr) => acc + (curr.jumlah_peserta || 0), 0) + " orang"],
  ];

  const infoWs = XLSX.utils.aoa_to_sheet(infoAoa);

  // Styling Sheet Info
  if (infoWs["A1"]) {
    infoWs["A1"].s = {
      font: { name: "Calibri", sz: 12, bold: true, color: { rgb: "1E293B" } },
    };
  }

  for (let r = 2; r < infoAoa.length; r++) {
    const cellA = infoWs[`A${r + 1}`];
    const cellB = infoWs[`B${r + 1}`];
    if (cellA) {
      cellA.s = {
        font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "334155" } },
        fill: { fgColor: { rgb: "E2E8F0" } },
        border: thinBorder,
      };
    }
    if (cellB) {
      cellB.s = {
        font: { name: "Calibri", sz: 10, color: { rgb: "0F172A" } },
        border: thinBorder,
      };
    }
  }

  infoWs["!cols"] = [{ wch: 20 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, infoWs, "Informasi Cetak");

  // ── 8. Download File ────────────────────────────────────────────────────
  const name = fileName || `Rekap_PKRS_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}
