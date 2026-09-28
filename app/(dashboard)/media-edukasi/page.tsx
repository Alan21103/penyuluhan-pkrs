import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import MediaEdukasiTable from "@/components/media-edukasi/MediaEdukasiTable";
import MediaEdukasiTrendChart from "@/components/media-edukasi/MediaEdukasiTrendChart";

export default async function MediaEdukasiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col flex-1">
      <Header title="Laporan Media Edukasi PKRS" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6 space-y-6">
        <MediaEdukasiTable />
        <MediaEdukasiTrendChart />
      </div>
    </div>
  );
}
