import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import AuditMutuForm from "@/components/audit-mutu/AuditMutuForm";

export default async function TambahAuditMutuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col flex-1">
      <Header title="Tambah Audit Indikator Mutu" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6">
        <AuditMutuForm mode="create" />
      </div>
    </div>
  );
}
