-- ============================================================
-- Migrasi Tambahan: Kolom Metadata Dokumen & Dokumentasi PKRS
-- Jalankan di Supabase SQL Editor jika belum ada
-- ============================================================

-- Tambah kolom is_external_link & file_type pada dokumen_upload jika belum ada
ALTER TABLE public.dokumen_upload 
ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'file',
ADD COLUMN IF NOT EXISTS is_external_link BOOLEAN DEFAULT FALSE;

-- Index untuk mempercepat query dokumen berdasarkan penyuluhan_id
CREATE INDEX IF NOT EXISTS idx_dokumen_upload_penyuluhan_id 
ON public.dokumen_upload (penyuluhan_id);

-- Pastikan bucket penyuluhan-files sudah public / memiliki signed URL yang berfungsi
INSERT INTO storage.buckets (id, name, public)
VALUES ('penyuluhan-files', 'penyuluhan-files', false)
ON CONFLICT (id) DO NOTHING;
