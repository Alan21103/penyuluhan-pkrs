import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import AuditMutuForm from "@/components/audit-mutu/AuditMutuForm";
import type { AuditMutu } from "@/types/audit-mutu";

export default async function AuditMutuEditPage({
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
    .from("audit_mutu")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return (
    <div className="flex flex-col flex-1">
      <Header title="Edit Audit Indikator Mutu" userEmail={user?.email} />
      <div className="flex-1 p-4 sm:p-6">
        <AuditMutuForm mode="edit" initialData={data as AuditMutu} />
      </div>
    </div>
  );
}
