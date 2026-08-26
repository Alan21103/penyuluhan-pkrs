import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import FormPenyuluhan from "@/components/penyuluhan/FormPenyuluhan";

export default async function TambahPenyuluhanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header title="Formulir Pelaksanaan" userEmail={user?.email} />
      <main className="flex-1 overflow-y-auto">
        <FormPenyuluhan mode="create" userId={user?.id ?? ""} />
      </main>
    </div>
  );
}
