import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { Penyuluhan, StatusPenyuluhan } from "@/types/penyuluhan";

/**
 * Service Layer untuk Domain Penyuluhan.
 * Berisi fungsi-fungsi CRUD dan query data yang terisolasi dari komponen UI.
 * (Mirip dengan Service / Repository Class di Laravel)
 */

export const penyuluhanService = {
  /**
   * Mengambil detail satu penyuluhan berdasarkan ID (Client-side)
   */
  async getById(id: string): Promise<Penyuluhan | null> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("penyuluhan")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`[penyuluhanService.getById] Error fetching ${id}:`, error.message);
      return null;
    }

    return data as Penyuluhan;
  },

  /**
   * Menyimpan data penyuluhan baru (Create / Store)
   */
  async create(payload: Partial<Penyuluhan>): Promise<{ data: Penyuluhan | null; error: string | null }> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("penyuluhan")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Penyuluhan, error: null };
  },

  /**
   * Memperbarui data penyuluhan yang ada (Update)
   */
  async update(id: string, payload: Partial<Penyuluhan>): Promise<{ data: Penyuluhan | null; error: string | null }> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("penyuluhan")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Penyuluhan, error: null };
  },

  /**
   * Menghapus data penyuluhan (Delete / Destroy)
   */
  async delete(id: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("penyuluhan")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  },

  /**
   * Mengubah status (Draft / Selesai)
   */
  async updateStatus(id: string, status: StatusPenyuluhan): Promise<{ success: boolean; error: string | null }> {
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("penyuluhan")
      .update({ status })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  },
};
