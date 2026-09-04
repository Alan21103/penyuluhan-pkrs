// services/audit-mutu.service.ts
import { createClient } from "@/lib/supabase/client";
import type { AuditMutu } from "@/types/audit-mutu";

export const auditMutuService = {
  async getAll(): Promise<AuditMutu[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("audit_mutu")
      .select("*")
      .order("tanggal_audit", { ascending: false });

    if (error) {
      console.error("[auditMutuService.getAll]", error.message);
      return [];
    }
    return (data ?? []) as AuditMutu[];
  },

  async getById(id: string): Promise<AuditMutu | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("audit_mutu")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[auditMutuService.getById]", error.message);
      return null;
    }
    return data as AuditMutu;
  },

  async create(
    payload: Partial<AuditMutu>
  ): Promise<{ data: AuditMutu | null; error: string | null }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("audit_mutu")
      .insert({ ...payload, created_by: user?.id })
      .select()
      .single();

    if (error) {
      console.error("[auditMutuService.create]", error.message);
      return { data: null, error: error.message };
    }
    return { data: data as AuditMutu, error: null };
  },

  async update(
    id: string,
    payload: Partial<AuditMutu>
  ): Promise<{ data: AuditMutu | null; error: string | null }> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("audit_mutu")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[auditMutuService.update]", error.message);
      return { data: null, error: error.message };
    }
    return { data: data as AuditMutu, error: null };
  },

  async delete(id: string): Promise<{ error: string | null }> {
    const supabase = createClient();
    const { error } = await supabase
      .from("audit_mutu")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[auditMutuService.delete]", error.message);
      return { error: error.message };
    }
    return { error: null };
  },
};
