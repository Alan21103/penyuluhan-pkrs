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
   * Menghapus data penyuluhan (Delete / Destroy) beserta file fisik di Supabase Storage
   */
  async delete(id: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = createBrowserClient();

    try {
      // 1. Ambil daftar file yang ada di dokumen_upload untuk penyuluhan ini
      const { data: docs } = await supabase
        .from("dokumen_upload")
        .select("file_url, is_external_link")
        .eq("penyuluhan_id", id);

      if (docs && docs.length > 0) {
        const pathsToDelete = docs
          .filter((d) => !d.is_external_link && d.file_url && !d.file_url.startsWith("http"))
          .map((d) => d.file_url);

        if (pathsToDelete.length > 0) {
          await supabase.storage.from("penyuluhan-files").remove(pathsToDelete);
        }
      }
    } catch (cleanupErr) {
      console.warn("[penyuluhanService.delete] Gagal membersihkan file storage:", cleanupErr);
    }

    // 2. Hapus record penyuluhan di database (dokumen_upload akan terhapus via CASCADE)
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

  /**
   * Mengunggah batch dokumen (file fisik ke storage + simpan metadata ke dokumen_upload)
   */
  async uploadDokumenBatch(
    penyuluhanId: string,
    userId: string,
    docs: Array<{
      jenis: string;
      file?: File;
      file_name: string;
      file_path?: string;
      file_size?: number;
      file_type?: string;
      is_external_link?: boolean;
    }>
  ): Promise<{ success: boolean; errors: string[] }> {
    const supabase = createBrowserClient();
    const errors: string[] = [];

    for (const doc of docs) {
      try {
        if (doc.is_external_link) {
          // Link cloud eksternal
          const { error: insertErr } = await supabase.from("dokumen_upload").insert({
            penyuluhan_id: penyuluhanId,
            jenis: doc.jenis,
            file_url: doc.file_path || doc.file_name,
            file_name: doc.file_name,
            file_size: 0,
            file_type: "link",
            is_external_link: true,
          });
          if (insertErr) errors.push(`Gagal simpan link ${doc.file_name}: ${insertErr.message}`);
        } else if (doc.file) {
          // File fisik
          const safeName = doc.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const storagePath = `${userId}/${penyuluhanId}/${doc.jenis.replace(/\s+/g, "_")}/${Date.now()}_${safeName}`;

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("penyuluhan-files")
            .upload(storagePath, doc.file, { upsert: false });

          if (uploadErr) {
            errors.push(`Gagal upload file ${doc.file_name}: ${uploadErr.message}`);
            continue;
          }

          const { error: insertErr } = await supabase.from("dokumen_upload").insert({
            penyuluhan_id: penyuluhanId,
            jenis: doc.jenis,
            file_url: uploadData.path,
            file_name: doc.file_name,
            file_size: doc.file_size || doc.file.size,
            file_type: doc.file_type || (doc.jenis === "Foto Kegiatan" ? "image" : "document"),
            is_external_link: false,
          });

          if (insertErr) {
            errors.push(`Gagal simpan data dokumen ${doc.file_name}: ${insertErr.message}`);
          }
        }
      } catch (err: any) {
        errors.push(`Error memproses ${doc.file_name}: ${err.message}`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  },
};

