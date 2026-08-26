-- ============================================================
-- Sprint 4 — Tambahan Schema
-- Jalankan di Supabase SQL Editor setelah schema.sql
-- ============================================================

-- Tabel riwayat revisi formulir penyuluhan
CREATE TABLE IF NOT EXISTS public.riwayat_revisi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  penyuluhan_id UUID NOT NULL REFERENCES public.penyuluhan(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  status_from TEXT,
  status_to TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.riwayat_revisi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Baca riwayat revisi" ON public.riwayat_revisi;
CREATE POLICY "Baca riwayat revisi"
  ON public.riwayat_revisi
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.penyuluhan
      WHERE id = penyuluhan_id
        AND (
          created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

DROP POLICY IF EXISTS "Insert riwayat revisi" ON public.riwayat_revisi;
CREATE POLICY "Insert riwayat revisi"
  ON public.riwayat_revisi
  FOR INSERT
  WITH CHECK (auth.uid() = changed_by);

-- Function: otomatis catat perubahan status
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.riwayat_revisi (penyuluhan_id, changed_by, status_from, status_to)
    VALUES (NEW.id, auth.uid(), OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS penyuluhan_status_log ON public.penyuluhan;
CREATE TRIGGER penyuluhan_status_log
  AFTER UPDATE ON public.penyuluhan
  FOR EACH ROW
  EXECUTE FUNCTION public.log_status_change();

-- Update Storage policy agar mendukung folder user_id
DROP POLICY IF EXISTS "User delete file sendiri" ON storage.objects;
CREATE POLICY "User delete file sendiri"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'penyuluhan-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Selesai! Sprint 4 schema siap.
