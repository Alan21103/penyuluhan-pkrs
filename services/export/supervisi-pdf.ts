// services/export/supervisi-pdf.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SupervisiBulanan } from "@/types/supervisi";

async function imgToBase64(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else resolve("");
    };
    img.onerror = () => resolve("");
    img.src = src;
  });
}

async function ensureBase64(src?: string): Promise<string> {
  if (!src?.trim()) return "";
  if (src.startsWith("data:image/")) return src;
  return await imgToBase64(src);
}

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

const hasilLabel = (k: string) =>
  ({ baik: "Baik", cukup: "Cukup", perlu_perbaikan: "Perlu Perbaikan" }[k] ?? k);

function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  neededHeight: number,
  margin = 12
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + neededHeight > pageHeight - margin - 8) {
    doc.addPage();
    return margin;
  }
  return currentY;
}

export async function generateSupervisiPDF(data: SupervisiBulanan): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const MARGIN = 12;
  const CW = W - MARGIN * 2;
  const BLACK: [number, number, number] = [0, 0, 0];
  let y = MARGIN;

  // ── KOP ──────────────────────────────────────────────────────────────────────
  const logo = await imgToBase64("/images/Logo.jpg");
  if (logo) doc.addImage(logo, "JPEG", MARGIN, y, 16, 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BLACK);
  doc.text("FORM SUPERVISI BULANAN PKRS", W / 2, y + 4, { align: "center" });
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.text(data.nama_rs || "UPTD Khusus RSUD dr. M. Yunus Bengkulu", W / 2, y + 9.5, {
    align: "center",
  });
  doc.text("Instalasi Promosi Kesehatan Rumah Sakit (PKRS)", W / 2, y + 14.5, {
    align: "center",
  });

  y += 18;
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 4;

  // ── A. IDENTITAS ─────────────────────────────────────────────────────────────
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("A. IDENTITAS SUPERVISI", MARGIN, y);
  y += 3;

  const identitas = [
    ["Unit / Ruang", data.unit_ruang || "-"],
    ["Bulan / Periode", data.bulan_periode || "-"],
    ["Tanggal Supervisi", fmtDate(data.tanggal_supervisi)],
    ["Supervisor", data.supervisor || "-"],
  ];
  autoTable(doc, {
    startY: y,
    body: identitas,
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 1.6, textColor: BLACK, lineColor: BLACK, lineWidth: 0.15 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45 },
      1: { cellWidth: CW - 45 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── B. CHECKLIST ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("B. CHECKLIST SUPERVISI", MARGIN, y);
  y += 3;

  const checkHead = [["No", "Item Supervisi", "Ya", "Tidak", "N/A", "Keterangan"]];
  const checkBody = data.checklist_supervisi.map((item) => [
    String(item.id),
    item.label,
    "",
    "",
    "",
    item.keterangan || "-",
  ]);

  autoTable(doc, {
    startY: y,
    head: checkHead,
    body: checkBody,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 1.6, textColor: BLACK, lineColor: BLACK, lineWidth: 0.15 },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: CW - 8 - 12 - 14 - 12 - 50 },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 50 },
    },
    didDrawCell: (hookData) => {
      if (hookData.section === "body") {
        const item = data.checklist_supervisi[hookData.row.index];
        if (!item) return;

        const isYa = hookData.column.index === 2 && item.nilai === "ya";
        const isTidak = hookData.column.index === 3 && item.nilai === "tidak";
        const isNa = hookData.column.index === 4 && item.nilai === "na";

        if (isYa || isTidak || isNa) {
          const { x: cellX, y: cellY, width: cellW, height: cellH } = hookData.cell;
          const cx = cellX + cellW / 2;
          const cy = cellY + cellH / 2;

          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.45);
          // Centang proporsional & presisi
          doc.line(cx - 1.8, cy - 0.2, cx - 0.5, cy + 1.3);
          doc.line(cx - 0.5, cy + 1.3, cx + 2.0, cy - 1.6);
        }
      }
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── C. HASIL SUPERVISI ───────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("C. HASIL SUPERVISI", MARGIN, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    body: [
      ["Jumlah Item Dinilai (exclude N/A)", String(data.jumlah_item_dinilai)],
      ["Jumlah Ya", String(data.jumlah_ya)],
      ["Jumlah Tidak", String(data.jumlah_tidak)],
      ["Persentase Kepatuhan", `${(data.persentase_kepatuhan ?? 0).toFixed(1)}%`],
      ["Kategori Hasil", hasilLabel(data.hasil_kategori)],
    ],
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 1.5, textColor: BLACK, lineColor: BLACK, lineWidth: 0.15 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 70 },
      1: { cellWidth: CW - 70 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── D. TEMUAN ────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("D. TEMUAN", MARGIN, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    body: [
      ["Ketidaksesuaian / Temuan", data.temuan_ketidaksesuaian || "-"],
      ["Hal yang Sudah Baik", data.hal_sudah_baik || "-"],
    ],
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 1.5, textColor: BLACK, lineColor: BLACK, lineWidth: 0.15 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55 },
      1: { cellWidth: CW - 55 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── E. TINDAK LANJUT ────────────────────────────────────────────────────────
  if (data.tindak_lanjut && data.tindak_lanjut.length > 0) {
    y = checkPageBreak(doc, y, 25, MARGIN);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("E. TINDAK LANJUT", MARGIN, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [["No", "Masalah", "Tindak Lanjut", "PIC", "Target"]],
      body: data.tindak_lanjut.map((t, i) => [
        i + 1,
        t.masalah || "-",
        t.tindak_lanjut || "-",
        t.pic || "-",
        t.target || "-",
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5, textColor: BLACK, lineColor: BLACK, lineWidth: 0.15 },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 45 },
        2: { cellWidth: CW - 8 - 45 - 28 - 25 },
        3: { cellWidth: 28 },
        4: { cellWidth: 25 },
      },
      margin: { left: MARGIN, right: MARGIN },
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  }

  // ── F. KESIMPULAN & REKOMENDASI ──────────────────────────────────────────────
  y = checkPageBreak(doc, y, 22, MARGIN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("F. KESIMPULAN & REKOMENDASI", MARGIN, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    body: [
      ["Kesimpulan", data.kesimpulan === "sesuai" ? "Sesuai" : "Perlu Perbaikan"],
      ["Rekomendasi Supervisor", data.rekomendasi_supervisor || "-"],
    ],
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 1.5, textColor: BLACK, lineColor: BLACK, lineWidth: 0.15 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55 },
      1: { cellWidth: CW - 55 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = (doc as any).lastAutoTable.finalY + 5;

  // ── G. TANDA TANGAN & PENGESAHAN (Formal Tanpa Kotak) ─────────────────────────
  // Memastikan tanda tangan tidak terpotong di tepi bawah (minimal butuh 36mm)
  y = checkPageBreak(doc, y, 36, MARGIN);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("G. TANDA TANGAN & PENGESAHAN", MARGIN, y);
  y += 5;

  const colW = (CW - 10) / 2;
  const col1X = MARGIN;
  const col2X = MARGIN + colW + 10;

  // Role titles
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Supervisor,", col1X, y);
  doc.text("PJ Unit / Ruang,", col2X, y);
  y += 2;

  // Load signature images
  const supervisorTtd = await ensureBase64(data.supervisor_ttd_url);
  const pjTtd = await ensureBase64(data.pj_unit_ttd_url);

  const ttdWidth = 35;
  const ttdHeight = 16;

  if (supervisorTtd) {
    try {
      const format = supervisorTtd.includes("data:image/jpeg") ? "JPEG" : "PNG";
      doc.addImage(supervisorTtd, format, col1X, y, ttdWidth, ttdHeight);
    } catch (e) {
      console.error("Gagal menyisipkan TTD Supervisor:", e);
    }
  }

  if (pjTtd) {
    try {
      const format = pjTtd.includes("data:image/jpeg") ? "JPEG" : "PNG";
      doc.addImage(pjTtd, format, col2X, y, ttdWidth, ttdHeight);
    } catch (e) {
      console.error("Gagal menyisipkan TTD PJ Unit:", e);
    }
  }

  y += ttdHeight + 2;

  // Nama Pejabat (teks tebal formal dengan kurung)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(
    data.supervisor_nama ? `( ${data.supervisor_nama} )` : "( _____________________ )",
    col1X,
    y
  );
  doc.text(
    data.pj_unit_nama ? `( ${data.pj_unit_nama} )` : "( _____________________ )",
    col2X,
    y
  );

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`NIP. ${data.supervisor_nip || "-"}`, col1X, y);
  doc.text(`NIP. ${data.pj_unit_nip || "-"}`, col2X, y);

  // ── Footer Halaman ───────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Halaman ${i} dari ${totalPages}  |  UPTD Khusus RSUD Dr. M. Yunus Bengkulu — Supervisi Bulanan PKRS`,
      W / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: "center" }
    );
  }

  return doc;
}

export async function downloadSupervisiPDF(data: SupervisiBulanan): Promise<void> {
  const doc = await generateSupervisiPDF(data);
  const safeDate = data.tanggal_supervisi?.replace(/-/g, "") ?? "nodate";
  const safeUnit = (data.unit_ruang ?? "").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  doc.save(`Supervisi_${safeUnit}_${safeDate}.pdf`);
}
