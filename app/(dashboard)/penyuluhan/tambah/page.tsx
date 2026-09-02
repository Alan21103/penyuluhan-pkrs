import { createClient } from "@/lib/supabase/server";
import FormPenyuluhan from "@/components/penyuluhan/FormPenyuluhan";

export default async function TambahPenyuluhanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <FormPenyuluhan mode="create" userId={user?.id ?? ""} />
    </div>
  );
}

