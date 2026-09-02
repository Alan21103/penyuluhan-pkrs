import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import StatusToggle from "@/components/penyuluhan/ApprovalFlow";
import DetailPenyuluhanView from "@/components/penyuluhan/DetailPenyuluhanView";
import DokumentasiGallery from "@/components/penyuluhan/DokumentasiGallery";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Pencil, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DetailPenyuluhanPage({ params }: PageProps<"/penyuluhan/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: penyuluhan } = await supabase
    .from("penyuluhan")
    .select("*")
    .eq("id", id)
    .single();

  if (!penyuluhan) notFound();

  const { data: dokumen } = await supabase
    .from("dokumen_upload")
    .select("*")
    .eq("penyuluhan_id", id);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Detail Formulir" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6">
        {/* Top nav */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <Link href="/penyuluhan" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/penyuluhan/${id}/edit`}>
              <Button variant="outline" className="gap-2 rounded-xl" id="btn-edit-from-detail">
                <Pencil className="w-4 h-4" /> Edit
              </Button>
            </Link>
            <DetailPenyuluhanView penyuluhanId={id} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Konten detail — 2/3 lebar */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-5">
            <DetailPenyuluhanContent data={penyuluhan} dokumen={dokumen ?? []} />
          </div>

          {/* Sidebar kanan — Status + Info */}
          <div className="space-y-4">
            <StatusToggle
              penyuluhanId={id}
              currentStatus={penyuluhan.status}
            />
            <RiwayatCard penyuluhan={penyuluhan} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
      <span className="text-xs text-foreground font-medium flex-1">{String(value ?? "-")}</span>
    </div>
  );
}

function SectionBox({ letter, title, children }: { letter: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/20">
        <span className="w-6 h-6 rounded-md bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
          {letter}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

async function DetailPenyuluhanContent({ data, dokumen }: { data: any; dokumen: any[] }) {
  const supabase = await createClient();

  const dokumenWithUrls = await Promise.all(
    dokumen.map(async (d: any) => {
      if (d.is_external_link || d.file_url.startsWith("http")) {
        return { ...d, signed_url: d.file_url };
      }
      const { data: urlData } = await supabase.storage
        .from("penyuluhan-files")
        .createSignedUrl(d.file_url, 3600);
      return { ...d, signed_url: urlData?.signedUrl ?? "" };
    })
  );

  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-";

  const pct = (paham: number, total: number) =>
    total > 0 ? `${Math.round((paham / total) * 100)}%` : "0%";

  return (
    <>
      {/* Header topik */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-lg font-bold text-foreground">{data.topik}</h2>
        <p className="text-sm text-muted-foreground mt-1">{data.sasaran}</p>
      </div>

      {/* Section A */}
      <SectionBox letter="A" title="Identitas Kegiatan">
        <InfoRow label="Hari / Tanggal" value={fmtDate(data.hari_tanggal)} />
        <InfoRow label="Waktu" value={`${data.waktu_mulai || "-"} – ${data.waktu_selesai || "-"} WIB`} />
        <InfoRow label="Tempat / Lokasi" value={data.tempat} />
        <InfoRow label="Unit / Instansi" value={data.unit_instansi} />
        <InfoRow label="Jumlah Peserta" value={`${data.jumlah_peserta} Orang`} />
        <InfoRow label="Penyuluh" value={(data.penyuluh ?? []).join(", ")} />
        <InfoRow label="Durasi" value={`${data.durasi} Menit`} />
        <InfoRow label="Metode" value={(data.metode ?? []).join(", ")} />
        <InfoRow label="Media" value={[(data.media ?? []).join(", "), data.media_lainnya].filter(Boolean).join(", ")} />
      </SectionBox>

      {/* Section B */}
      <SectionBox letter="B" title="Tujuan Penyuluhan">
        <ol className="list-decimal list-inside space-y-1.5">
          {(data.tujuan_penyuluhan ?? []).filter(Boolean).map((t: string, i: number) => (
            <li key={i} className="text-sm text-foreground">{t}</li>
          ))}
        </ol>
      </SectionBox>

      {/* Section C */}
      <SectionBox letter="C" title="Materi yang Disampaikan">
        <ol className="list-decimal list-inside space-y-1.5">
          {(data.materi_disampaikan ?? []).filter(Boolean).map((m: string, i: number) => (
            <li key={i} className="text-sm text-foreground">{m}</li>
          ))}
        </ol>
      </SectionBox>

      {/* Section D */}
      <SectionBox letter="D" title="Checklist Evaluasi Proses">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1.5 text-muted-foreground font-medium">Item</th>
              <th className="text-center py-1.5 text-muted-foreground font-medium w-10">Ya</th>
              <th className="text-center py-1.5 text-muted-foreground font-medium w-12">Tidak</th>
              <th className="text-left py-1.5 text-muted-foreground font-medium">Ket.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {(data.checklist_evaluasi ?? []).map((c: any, i: number) => (
              <tr key={i} className="text-foreground/80">
                <td className="py-2">{c.item}</td>
                <td className="text-center py-2">
                  {c.ya ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  ) : (
                    <span className="text-muted-foreground/30 text-xs">-</span>
                  )}
                </td>
                <td className="text-center py-2">
                  {c.tidak ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  ) : (
                    <span className="text-muted-foreground/30 text-xs">-</span>
                  )}
                </td>
                <td className="py-2 text-muted-foreground">{c.keterangan || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBox>

      {/* Section E */}
      <SectionBox letter="E" title="Hasil Verifikasi Pemahaman">
        <InfoRow label="Jumlah Peserta" value={`${data.jumlah_peserta_e} Orang`} />
        <InfoRow label="Jumlah Paham" value={`${data.jumlah_paham} Orang`} />
        <InfoRow label="Persentase Pemahaman" value={pct(data.jumlah_paham, data.jumlah_peserta_e)} />
        <InfoRow label="Metode Verifikasi" value={(data.metode_verifikasi ?? []).join(", ")} />
      </SectionBox>

      {/* Section F */}
      <SectionBox letter="F" title="Hasil Evaluasi">
        <InfoRow label="Hal yang Sudah Baik" value={data.hal_baik} />
        <InfoRow label="Kendala" value={data.kendala} />
        <InfoRow label="Rencana Tindak Lanjut" value={data.rencana_tindak_lanjut} />
      </SectionBox>

      {/* Section G — Dokumen */}
      <SectionBox letter="G" title="Dokumentasi">
        <DokumentasiGallery
          dokumen={dokumenWithUrls}
          dokumenChecklist={data.dokumen_checklist ?? []}
        />
      </SectionBox>

      {/* Tanda Tangan */}
      <SectionBox letter="✎" title="Tanda Tangan & Pengesahan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Penanggung Jawab PKRS</p>
            <InfoRow label="Nama" value={data.pj_pkrs_nama} />
            <InfoRow label="NIP" value={data.pj_pkrs_nip} />
            {data.pj_pkrs_ttd_url && (
              <div className="mt-2 border border-border rounded-lg overflow-hidden h-20 flex items-center justify-center bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.pj_pkrs_ttd_url} alt="TTD PJ PKRS" className="max-h-16 object-contain" />
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Penyuluh</p>
            <InfoRow label="Nama" value={data.penyuluh_nama} />
            <InfoRow label="NIP" value={data.penyuluh_nip} />
            {data.penyuluh_ttd_url && (
              <div className="mt-2 border border-border rounded-lg overflow-hidden h-20 flex items-center justify-center bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.penyuluh_ttd_url} alt="TTD Penyuluh" className="max-h-16 object-contain" />
              </div>
            )}
          </div>
        </div>
      </SectionBox>
    </>
  );
}

function RiwayatCard({ penyuluhan }: { penyuluhan: any }) {
  const fmtDt = (d: string) =>
    d ? new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">Riwayat</h3>
      <div className="space-y-3 text-xs">
        <div className="flex gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Dibuat</p>
            <p className="text-muted-foreground">{fmtDt(penyuluhan.created_at)}</p>
          </div>
        </div>
        {penyuluhan.updated_at !== penyuluhan.created_at && (
          <div className="flex gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Terakhir diubah</p>
              <p className="text-muted-foreground">{fmtDt(penyuluhan.updated_at)}</p>
            </div>
          </div>
        )}
        <div className="flex gap-2.5">
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
            penyuluhan.status === "selesai" ? "bg-emerald-500" : "bg-amber-400"
          }`} />
          <div>
            <p className="font-medium text-foreground">Status sekarang</p>
            <p className="text-muted-foreground capitalize">{penyuluhan.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
