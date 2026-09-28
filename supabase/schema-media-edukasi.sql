-- ============================================================
-- SIPINTAR PKRS — Laporan Bulanan Media Edukasi
-- Migration Script — Jalankan di Supabase SQL Editor
-- ============================================================

-- Tabel: laporan_media_edukasi
CREATE TABLE IF NOT EXISTS public.laporan_media_edukasi (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  periode_bulan     TEXT NOT NULL DEFAULT '',
  tahun             TEXT NOT NULL DEFAULT '',
  penanggung_jawab  TEXT NOT NULL DEFAULT '',
  petugas_pelaporan TEXT NOT NULL DEFAULT '',

  -- Items: array of media entries
  -- [{ id, tanggal_nomor, jenis_media, bentuk_media, judul_materi, lokasi_platform, jumlah_distribusi, sasaran }]
  items             JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Status
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','selesai')),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at (reuse existing function if available)
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS $fn$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $fn$;
EXCEPTION WHEN duplicate_function THEN NULL;
END $$;

DROP TRIGGER IF EXISTS laporan_media_edukasi_updated_at ON public.laporan_media_edukasi;
CREATE TRIGGER laporan_media_edukasi_updated_at
  BEFORE UPDATE ON public.laporan_media_edukasi
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: Semua authenticated user bisa akses semua data
ALTER TABLE public.laporan_media_edukasi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_media_edukasi" ON public.laporan_media_edukasi;
CREATE POLICY "authenticated_all_media_edukasi" ON public.laporan_media_edukasi
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
