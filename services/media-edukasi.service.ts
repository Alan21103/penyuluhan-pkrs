// services/media-edukasi.service.ts
import { createClient } from "@/lib/supabase/client";
import type { LaporanMediaEdukasi } from "@/types/media-edukasi";

export const mediaEdukasiService = {
  async getAll(): Promise<LaporanMediaEdukasi[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("laporan_media_edukasi")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[mediaEdukasiService.getAll]", error.message);
      return [];
    }
    return (data ?? []) as LaporanMediaEdukasi[];
  },

  async getById(id: string): Promise<LaporanMediaEdukasi | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("laporan_media_edukasi")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[mediaEdukasiService.getById]", error.message);
      return null;
    }
    return data as LaporanMediaEdukasi;
  },

  async create(
    payload: Partial<LaporanMediaEdukasi>
  ): Promise<{ data: LaporanMediaEdukasi | null; error: string | null }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("laporan_media_edukasi")
      .insert({ ...payload, created_by: user?.id })
      .select()
      .single();

    if (error) {
      console.error("[mediaEdukasiService.create]", error.message);
      return { data: null, error: error.message };
    }
    return { data: data as LaporanMediaEdukasi, error: null };
  },

  async update(
    id: string,
    payload: Partial<LaporanMediaEdukasi>
  ): Promise<{ data: LaporanMediaEdukasi | null; error: string | null }> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("laporan_media_edukasi")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[mediaEdukasiService.update]", error.message);
      return { data: null, error: error.message };
    }
    return { data: data as LaporanMediaEdukasi, error: null };
  },

  async delete(id: string): Promise<{ error: string | null }> {
    const supabase = createClient();
    const { error } = await supabase
      .from("laporan_media_edukasi")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[mediaEdukasiService.delete]", error.message);
      return { error: error.message };
    }
    return { error: null };
  },
};
