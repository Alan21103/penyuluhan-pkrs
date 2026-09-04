import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import AuditMutuTable from "@/components/audit-mutu/AuditMutuTable";

export default async function AuditMutuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col flex-1">
      <Header title="Audit Indikator Mutu PKRS" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6">
        <AuditMutuTable />
      </div>
    </div>
  );
}
