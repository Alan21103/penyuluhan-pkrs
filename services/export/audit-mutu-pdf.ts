// services/export/audit-mutu-pdf.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AuditMutu } from "@/types/audit-mutu";

async function imgToBase64(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.drawImage(img, 0, 0); resolve(canvas.toDataURL("image/png")); }
      else resolve("");
    };
    img.onerror = () => resolve("");
    img.src = src;
  });
}

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-";

export async function generateAuditMutuPDF(data: AuditMutu): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const MARGIN = 15;
  const CW = W - MARGIN * 2;
  const BLACK: [number, number, number] = [0, 0, 0];
  let y = MARGIN;

  // ── KOP ──────────────────────────────────────────────────────────────────────
  const logo = await imgToBase64("/images/Logo.jpg");
  if (logo) doc.addImage(logo, "JPEG", MARGIN, y, 18, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BLACK);
  doc.text("FORM AUDIT INDIKATOR MUTU PKRS", W / 2, y + 5, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("UPTD Khusus RSUD dr. M. Yunus Bengkulu", W / 2, y + 11, { align: "center" });
  doc.text("Instalasi Promosi Kesehatan Rumah Sakit (PKRS)", W / 2, y + 16, { align: "center" });

  y += 22;
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 5;

  // ── IDENTITAS ─────────────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("A. IDENTITAS AUDIT", MARGIN, y);
  y += 4;

  const colW2 = (CW - 10) / 2;
  autoTable(doc, {
    startY: y,
    body: [
      ["Periode Audit", data.periode_audit || "-", "Unit / Ruangan", data.unit_ruangan || "-"],
      ["Bulan", data.bulan || "-", "Tanggal Audit", fmtDate(data.tanggal_audit)],
      ["Auditor", data.auditor || "-", "", ""],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2, textColor: BLACK },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 35 },
      1: { cellWidth: colW2 - 35 },
      2: { fontStyle: "bold", cellWidth: 35 },
      3: { cellWidth: colW2 - 35 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── CHECKLIST AUDIT ───────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("B. CHECKLIST INDIKATOR MUTU", MARGIN, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["No", "Indikator Mutu", "Standar/Target", "Ya", "Tidak", "Jml Sampel", "Jml Sesuai", "Capaian (%)", "Keterangan"]],
    body: data.checklist_audit.map((item) => [
      item.id,
      item.indikator,
      item.standar_target,
      item.ya ? "✓" : "",
      item.tidak ? "✓" : "",
      item.jumlah_sampel,
      item.jumlah_sesuai,
      item.jumlah_sampel > 0 ? `${((item.jumlah_sesuai / item.jumlah_sampel) * 100).toFixed(1)}%` : "-",
      item.keterangan || "-",
    ]),
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 2, textColor: BLACK },
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 70 },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 8, halign: "center" },
      4: { cellWidth: 10, halign: "center" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 18, halign: "center" },
      7: { cellWidth: 20, halign: "center" },
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  return doc;
}

export async function downloadAuditMutuPDF(data: AuditMutu): Promise<void> {
  const doc = await generateAuditMutuPDF(data);
  const safeDate = data.tanggal_audit?.replace(/-/g, "") ?? "nodate";
  const safeUnit = (data.unit_ruangan ?? "").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  doc.save(`AuditMutu_${safeUnit}_${safeDate}.pdf`);
}
