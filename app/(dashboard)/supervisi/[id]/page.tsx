import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import SupervisiDetail from "@/components/supervisi/SupervisiDetail";
import type { SupervisiBulanan } from "@/types/supervisi";

export default async function SupervisiDetailPage({
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
    .from("supervisi_bulanan")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return (
    <div className="flex flex-col flex-1">
      <Header title="Detail Supervisi Bulanan" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6">
        <SupervisiDetail data={data as SupervisiBulanan} />
      </div>
    </div>
  );
}
