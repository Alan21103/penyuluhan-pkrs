import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import MediaEdukasiDetail from "@/components/media-edukasi/MediaEdukasiDetail";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";

export default async function MediaEdukasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("laporan_media_edukasi")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return (
    <div className="flex flex-col flex-1">
      <Header title="Detail Laporan Media Edukasi" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6">
        <MediaEdukasiDetail data={data as LaporanMediaEdukasi} />
      </div>
    </div>
  );
}
