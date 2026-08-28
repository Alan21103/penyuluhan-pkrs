import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import LaporanView from "@/components/laporan/LaporanView";

export default async function LaporanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("penyuluhan")
    .select("*")
    .order("hari_tanggal", { ascending: false });

  return (
    <div className="flex flex-col flex-1">
      <Header title="Laporan Rekap" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6">
        <LaporanView data={data ?? []} />
      </div>
    </div>
  );
}
