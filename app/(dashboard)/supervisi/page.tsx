import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import SupervisiTable from "@/components/supervisi/SupervisiTable";

export default async function SupervisiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col flex-1">
      <Header title="Supervisi Bulanan PKRS" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6">
        <SupervisiTable />
      </div>
    </div>
  );
}
