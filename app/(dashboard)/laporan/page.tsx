import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import LaporanHub from "@/components/laporan/LaporanHub";
import type { Penyuluhan } from "@/types/penyuluhan";
import type { SupervisiBulanan } from "@/types/supervisi";
import type { AuditMutu } from "@/types/audit-mutu";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";

export default async function LaporanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [penyuluhanRes, supervisiRes, auditMutuRes, mediaEdukasiRes] = await Promise.all([
    supabase
      .from("penyuluhan")
      .select("*")
      .order("hari_tanggal", { ascending: false }),
    supabase
      .from("supervisi_bulanan")
      .select("*")
      .order("tanggal_supervisi", { ascending: false }),
    supabase
      .from("audit_indikator_mutu")
      .select("*")
      .order("tanggal_audit", { ascending: false }),
    supabase
      .from("laporan_media_edukasi")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const penyuluhanData = (penyuluhanRes.data ?? []) as Penyuluhan[];
  const supervisiData = (supervisiRes.data ?? []) as SupervisiBulanan[];
  const auditMutuData = (auditMutuRes.data ?? []) as AuditMutu[];
  const mediaEdukasiData = (mediaEdukasiRes.data ?? []) as LaporanMediaEdukasi[];

  return (
    <div className="flex flex-col flex-1">
      <Header title="Laporan Rekap PKRS" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6">
        <LaporanHub
          penyuluhanData={penyuluhanData}
          supervisiData={supervisiData}
          auditMutuData={auditMutuData}
          mediaEdukasiData={mediaEdukasiData}
        />
      </div>
    </div>
  );
}
