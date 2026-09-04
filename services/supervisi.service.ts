// services/supervisi.service.ts
import { createClient } from "@/lib/supabase/client";
import type { SupervisiBulanan } from "@/types/supervisi";

export const supervisiService = {
  async getAll(): Promise<SupervisiBulanan[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("supervisi_bulanan")
      .select("*")
      .order("tanggal_supervisi", { ascending: false });

    if (error) {
      console.error("[supervisiService.getAll]", error.message);
      return [];
    }
    return (data ?? []) as SupervisiBulanan[];
  },

  async getById(id: string): Promise<SupervisiBulanan | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("supervisi_bulanan")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[supervisiService.getById]", error.message);
      return null;
    }
    return data as SupervisiBulanan;
  },

  async create(
    payload: Partial<SupervisiBulanan>
  ): Promise<{ data: SupervisiBulanan | null; error: string | null }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("supervisi_bulanan")
      .insert({ ...payload, created_by: user?.id })
      .select()
      .single();

    if (error) {
      console.error("[supervisiService.create]", error.message);
      return { data: null, error: error.message };
    }
    return { data: data as SupervisiBulanan, error: null };
  },

  async update(
    id: string,
    payload: Partial<SupervisiBulanan>
  ): Promise<{ data: SupervisiBulanan | null; error: string | null }> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("supervisi_bulanan")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[supervisiService.update]", error.message);
      return { data: null, error: error.message };
    }
    return { data: data as SupervisiBulanan, error: null };
  },

  async delete(id: string): Promise<{ error: string | null }> {
    const supabase = createClient();
    const { error } = await supabase
      .from("supervisi_bulanan")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[supervisiService.delete]", error.message);
      return { error: error.message };
    }
    return { error: null };
  },
};
