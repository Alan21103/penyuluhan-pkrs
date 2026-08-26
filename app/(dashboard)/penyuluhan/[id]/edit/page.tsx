import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
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
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="Edit Formulir Pelaksanaan" userEmail={user?.email} />
      <main className="flex-1 overflow-y-auto">
        <FormPenyuluhan mode="edit" userId={user?.id ?? ""} initialData={data} />
      </main>
    </div>
  );
}
