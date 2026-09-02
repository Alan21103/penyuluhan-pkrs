import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Penyuluhan, ChecklistItem } from "@/types/penyuluhan";

// ─── Helper: load image → base64 via canvas ──────────────────────────────────
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
      } else {
        resolve("");
      }
    };
    img.onerror = () => resolve("");
    img.src = src;
  });
}

async function ensureBase64(src?: string): Promise<string> {
  if (!src || !src.trim()) return "";
  if (src.startsWith("data:image/")) return src;
  return await imgToBase64(src);
}

// ─── Formatter ────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

const pct = (paham: number, total: number) =>
  total > 0 ? `${Math.round((paham / total) * 100)}%` : "0%";

// ─── Main PDF Export Function ─────────────────────────────────────────────────
export async function generatePDF(data: Penyuluhan): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = doc.internal.pageSize.getWidth();
  const MARGIN = 15;
  const CONTENT_W = W - MARGIN * 2;
  const BLACK: [number, number, number] = [0, 0, 0];

  let y = MARGIN;

  // ── KOP SURAT (Hitam & Putih Resmi) ──────────────────────────────────────────
  const logoB64 = await imgToBase64("/images/Logo.jpg");

  const logoW = 26;
  const logoH = 26;

  // Logo di sebelah kiri (sesuai template surat resmi)
  if (logoB64) {
    try {
      doc.addImage(logoB64, "PNG", MARGIN, y - 4, logoW, logoH);
    } catch (e) {
      console.error("Gagal memuat logo di PDF:", e);
    }
  }

  // Teks Kop Surat (Center Aligned, disesuaikan dengan ruang setelah logo kiri)
  const textCenterX = (MARGIN + logoW + W - MARGIN) / 2.2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.text("PEMERINTAH PROVINSI BENGKULU", textCenterX, y + 3, { align: "center" });

  doc.setFontSize(12);
  doc.text("DINAS KESEHATAN", textCenterX, y + 8, { align: "center" });

  doc.setFontSize(13);
  doc.text("UPTD KHUSUS RSUD dr. M.YUNUS", textCenterX, y + 14, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    "Jl. Bhayangkara Bengkulu 38229 Telp. (0736) 52004 – 52006 Fax (0736) 52007",
    textCenterX,
    y + 19,
    { align: "center" }
  );

  // Garis Separator Kop Surat (Garis tebal + garis tipis)
  y += 24;
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(1.0);
  doc.line(MARGIN, y, W - MARGIN, y);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 1.2, W - MARGIN, y + 1.2);

  // ── JUDUL FORMULIR ────────────────────────────────────────────────────────
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BLACK);
  doc.text("FORMULIR PELAKSANAAN PENYULUHAN KELOMPOK", W / 2, y, { align: "center" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Promosi Kesehatan Rumah Sakit (PKRS)", W / 2, y, { align: "center" });

  y += 8;

  // ── SECTION A — Identitas Kegiatan ────────────────────────────────────────
  y = sectionHeader(doc, "A", "IDENTITAS KEGIATAN", y, MARGIN, CONTENT_W);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 2, textColor: BLACK, lineColor: BLACK, lineWidth: 0.2 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" }, 1: { cellWidth: 5 } },
    body: [
      ["Hari / Tanggal", ":", fmtDate(data.hari_tanggal)],
      ["Waktu", ":", `${data.waktu_mulai || "-"} – ${data.waktu_selesai || "-"} WIB`],
      ["Tempat / Lokasi", ":", data.tempat || "-"],
      ["Topik Penyuluhan", ":", data.topik || "-"],
      ["Sasaran", ":", data.sasaran || "-"],
      ["Jumlah Peserta", ":", `${data.jumlah_peserta} Orang`],
      ["Penyuluh", ":", (data.penyuluh ?? []).join(", ") || "-"],
      ["Unit / Instansi", ":", data.unit_instansi || "-"],
      ["Durasi", ":", `${data.durasi} Menit`],
      ["Metode", ":", (data.metode ?? []).join(", ") || "-"],
      ["Media", ":", [(data.media ?? []).join(", "), data.media_lainnya].filter(Boolean).join(", ") || "-"],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  // ── SECTION B — Tujuan Penyuluhan ─────────────────────────────────────────
  y = sectionHeader(doc, "B", "TUJUAN PENYULUHAN", y, MARGIN, CONTENT_W);

  const tujuan = (data.tujuan_penyuluhan ?? []).filter(Boolean);
  if (tujuan.length === 0) tujuan.push("-");
  tujuan.forEach((t, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BLACK);
    const lines = doc.splitTextToSize(`${i + 1}. ${t}`, CONTENT_W - 4);
    doc.text(lines, MARGIN + 2, y);
    y += lines.length * 4.5;
  });
  y += 2;

  // ── SECTION C — Materi yang Disampaikan ───────────────────────────────────
  y = checkPageBreak(doc, y, 25, MARGIN);
  y = sectionHeader(doc, "C", "MATERI YANG DISAMPAIKAN", y, MARGIN, CONTENT_W);

  const materi = (data.materi_disampaikan ?? []).filter(Boolean);
  if (materi.length === 0) materi.push("-");
  materi.forEach((m, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BLACK);
    const lines = doc.splitTextToSize(`${i + 1}. ${m}`, CONTENT_W - 4);
    doc.text(lines, MARGIN + 2, y);
    y += lines.length * 4.5;
  });
  y += 2;

  // ── SECTION D — Pelaksanaan (Checklist) ───────────────────────────────────
  y = checkPageBreak(doc, y, 50, MARGIN);
  y = sectionHeader(doc, "D", "PELAKSANAAN — CHECKLIST EVALUASI PROSES", y, MARGIN, CONTENT_W);

  const checklist: ChecklistItem[] = data.checklist_evaluasi ?? [];
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, textColor: BLACK, lineColor: BLACK, lineWidth: 0.2 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 95 },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 12, halign: "center" },
      4: {},
    },
    head: [["No", "Item Evaluasi", "Ya", "Tidak", "Keterangan"]],
    body: checklist.map((c, i) => [
      i + 1,
      c.item,
      "",
      "",
      c.keterangan || "",
    ]),
    didDrawCell: (hookData) => {
      if (hookData.section === "body") {
        const item = checklist[hookData.row.index];
        if (!item) return;

        const isYa = hookData.column.index === 2 && (item.ya === true || String(item.ya) === "true");
        const isTidak = hookData.column.index === 3 && (item.tidak === true || String(item.tidak) === "true");

        if (isYa || isTidak) {
          const { x, y: cellY, width, height } = hookData.cell;
          const cx = x + width / 2;
          const cy = cellY + height / 2;

          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.55);
          // Gambar garis centang (checkmark) tebal & proporsional
          doc.line(cx - 2.0, cy - 0.2, cx - 0.6, cy + 1.5);
          doc.line(cx - 0.6, cy + 1.5, cx + 2.2, cy - 1.8);
        }
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── SECTION E — Verifikasi Pemahaman ──────────────────────────────────────
  y = checkPageBreak(doc, y, 35, MARGIN);
  y = sectionHeader(doc, "E", "HASIL VERIFIKASI PEMAHAMAN", y, MARGIN, CONTENT_W);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 2, textColor: BLACK, lineColor: BLACK, lineWidth: 0.2 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 90, fontStyle: "bold" }, 1: { cellWidth: 5 } },
    body: [
      ["Jumlah Peserta", ":", `${data.jumlah_peserta_e} Orang`],
      ["Jumlah Peserta yang Paham", ":", `${data.jumlah_paham} Orang`],
      ["Persentase Pemahaman", ":", pct(data.jumlah_paham, data.jumlah_peserta_e)],
      ["Metode Verifikasi", ":", (data.metode_verifikasi ?? []).join(", ") || "-"],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── SECTION F — Hasil Evaluasi ────────────────────────────────────────────
  y = checkPageBreak(doc, y, 35, MARGIN);
  y = sectionHeader(doc, "F", "HASIL EVALUASI", y, MARGIN, CONTENT_W);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 2, textColor: BLACK, lineColor: BLACK, lineWidth: 0.2 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" }, 1: { cellWidth: 5 } },
    body: [
      ["Hal yang Sudah Baik", ":", data.hal_baik || "-"],
      ["Kendala", ":", data.kendala || "-"],
      ["Rencana Tindak Lanjut", ":", data.rencana_tindak_lanjut || "-"],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── SECTION G — Dokumentasi ───────────────────────────────────────────────
  y = checkPageBreak(doc, y, 15, MARGIN);
  y = sectionHeader(doc, "G", "DOKUMENTASI", y, MARGIN, CONTENT_W);
  y += 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...BLACK);
  const dokList = (data.dokumen_checklist ?? []).join(", ") || "-";
  doc.text(`Jenis Dokumentasi: ${dokList}`, MARGIN + 2, y);
  y += 7;

  // ── TANDA TANGAN & PENGESAHAN ────────────────────────────────────────────
  y = checkPageBreak(doc, y, 45, MARGIN);

  // Garis pembatas sebelum TTD
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 5;

  const colW = CONTENT_W / 2 - 5;
  const col1X = MARGIN;
  const col2X = MARGIN + colW + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BLACK);
  doc.text("Penanggung Jawab PKRS,", col1X, y);
  doc.text("Penyuluh,", col2X, y);

  y += 4;

  // Load Gambar Tanda Tangan
  const pjTtdB64 = await ensureBase64(data.pj_pkrs_ttd_url);
  const penyuluhTtdB64 = await ensureBase64(data.penyuluh_ttd_url);

  const ttdHeight = 18;
  const ttdWidth = 35;

  if (pjTtdB64) {
    try {
      const format = pjTtdB64.includes("data:image/jpeg") ? "JPEG" : "PNG";
      doc.addImage(pjTtdB64, format, col1X, y, ttdWidth, ttdHeight);
    } catch (e) {
      console.error("Gagal menggambar TTD PJ PKRS:", e);
    }
  }

  if (penyuluhTtdB64) {
    try {
      const format = penyuluhTtdB64.includes("data:image/jpeg") ? "JPEG" : "PNG";
      doc.addImage(penyuluhTtdB64, format, col2X, y, ttdWidth, ttdHeight);
    } catch (e) {
      console.error("Gagal menggambar TTD Penyuluh:", e);
    }
  }

  y += ttdHeight + 2;

  // Nama & NIP
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(data.pj_pkrs_nama ? `( ${data.pj_pkrs_nama} )` : "( _____________________ )", col1X, y);
  doc.text(data.penyuluh_nama ? `( ${data.penyuluh_nama} )` : "( _____________________ )", col2X, y);

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`NIP. ${data.pj_pkrs_nip || "____________________"}`, col1X, y);
  doc.text(`NIP. ${data.penyuluh_nip || "____________________"}`, col2X, y);

  // Footer Halaman (Hitam)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BLACK);
    doc.text(
      `Halaman ${i} dari ${totalPages}  |  UPTD KHUSUS RSUD Dr. M. Yunus Bengkulu — Sistem PKRS`,
      W / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: "center" }
    );
  }

  return doc;
}

export function getPDFFilename(data: Penyuluhan): string {
  const safeTopic = (data.topik || "Formulir").replace(/[^a-zA-Z0-9_\-\s]/g, "").slice(0, 40);
  const dateStr = data.hari_tanggal?.replace(/-/g, "") || "tanpa-tanggal";
  return `Formulir_PKRS_${safeTopic}_${dateStr}.pdf`;
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sectionHeader(
  doc: jsPDF,
  letter: string,
  title: string,
  y: number,
  margin: number,
  contentW: number
): number {
  doc.setFillColor(0, 0, 0);
  doc.roundedRect(margin, y, contentW, 6.5, 0.5, 0.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`${letter}.  ${title}`, margin + 3, y + 4.5);
  return y + 9;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number, margin: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - margin) {
    doc.addPage();
    return margin;
  }
  return y;
}
