-- ============================================================
-- Fix Infinite Recursion Error (42P17) di Supabase RLS
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- 1. Buat Helper Function (SECURITY DEFINER)
-- Function ini berjalan tanpa RLS sehingga memutus loop rekursi
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Fix Policy PROFILES
DROP POLICY IF EXISTS "Profil sendiri saja" ON public.profiles;
DROP POLICY IF EXISTS "Admin lihat semua profil" ON public.profiles;

CREATE POLICY "Akses profil"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 3. Fix Policy PENYULUHAN
DROP POLICY IF EXISTS "Petugas CRUD data sendiri" ON public.penyuluhan;
DROP POLICY IF EXISTS "Admin akses semua penyuluhan" ON public.penyuluhan;

CREATE POLICY "Akses penyuluhan"
  ON public.penyuluhan
  FOR ALL
  USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());

-- 4. Fix Policy DOKUMEN UPLOAD
DROP POLICY IF EXISTS "Akses dokumen via penyuluhan" ON public.dokumen_upload;

CREATE POLICY "Akses dokumen via penyuluhan"
  ON public.dokumen_upload
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.penyuluhan
      WHERE id = penyuluhan_id
        AND (created_by = auth.uid() OR public.is_admin())
    )
  );

-- 5. Fix Policy STORAGE OBJECTS
DROP POLICY IF EXISTS "Admin akses semua file" ON storage.objects;

CREATE POLICY "Admin akses semua file"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'penyuluhan-files'
    AND public.is_admin()
  );

-- Done!
