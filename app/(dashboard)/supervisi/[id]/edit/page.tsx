import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import SupervisiForm from "@/components/supervisi/SupervisiForm";
import type { SupervisiBulanan } from "@/types/supervisi";

export default async function SupervisiEditPage({
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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <SupervisiForm mode="edit" initialData={data as SupervisiBulanan} />
    </div>
  );
}
