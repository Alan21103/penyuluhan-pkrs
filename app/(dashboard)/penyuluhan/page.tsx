import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import PenyuluhanTable from "@/components/penyuluhan/PenyuluhanTable";

export default async function PenyuluhanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: penyuluhanList } = await supabase
    .from("penyuluhan")
    .select("id, hari_tanggal, topik, tempat, penyuluh, sasaran, jumlah_peserta, status, created_at")
    .order("hari_tanggal", { ascending: false });

  return (
    <div className="flex flex-col flex-1">
      <Header title="Data Penyuluhan" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6">
        <PenyuluhanTable data={penyuluhanList ?? []} />
      </div>
    </div>
  );
}
