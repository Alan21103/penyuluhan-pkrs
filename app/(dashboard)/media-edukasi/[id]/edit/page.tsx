import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import MediaEdukasiForm from "@/components/media-edukasi/MediaEdukasiForm";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";

export default async function MediaEdukasiEditPage({
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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <MediaEdukasiForm mode="edit" initialData={data as LaporanMediaEdukasi} />
    </div>
  );
}
