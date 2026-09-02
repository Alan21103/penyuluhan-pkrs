import { createClient } from "@/lib/supabase/server";
import FormPenyuluhan from "@/components/penyuluhan/FormPenyuluhan";
import { notFound } from "next/navigation";

export default async function EditPenyuluhanPage({ params }: PageProps<"/penyuluhan/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("penyuluhan")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <FormPenyuluhan mode="edit" userId={user?.id ?? ""} initialData={data} />
    </div>
  );
}

