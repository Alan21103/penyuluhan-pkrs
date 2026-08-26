-- ============================================================
-- PKRS Database Setup Script
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tabel profil user (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL DEFAULT '',
  nip TEXT,
  role TEXT NOT NULL DEFAULT 'petugas' CHECK (role IN ('admin', 'petugas')),
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: otomatis buat profil saat user baru daftar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nama)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. Tabel utama penyuluhan
-- ============================================================
CREATE TABLE IF NOT EXISTS public.penyuluhan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'diajukan', 'terverifikasi')),

  -- Bagian A: Identitas Kegiatan
  hari_tanggal DATE NOT NULL,
  waktu_mulai TIME NOT NULL,
  waktu_selesai TIME NOT NULL,
  tempat TEXT NOT NULL DEFAULT '',
  topik TEXT NOT NULL DEFAULT '',
  sasaran TEXT NOT NULL DEFAULT '',
  jumlah_peserta INTEGER NOT NULL DEFAULT 0 CHECK (jumlah_peserta >= 0),
  penyuluh TEXT[] NOT NULL DEFAULT '{}',
  unit_instansi TEXT NOT NULL DEFAULT '',
  durasi INTEGER NOT NULL DEFAULT 0 CHECK (durasi >= 0), -- dalam menit
  metode TEXT[] NOT NULL DEFAULT '{}',
  media TEXT[] NOT NULL DEFAULT '{}',
  media_lainnya TEXT,

  -- Bagian B: Tujuan Penyuluhan
  tujuan_penyuluhan TEXT[] NOT NULL DEFAULT '{}',

  -- Bagian C: Materi yang Disampaikan
  materi_disampaikan TEXT[] NOT NULL DEFAULT '{}',

  -- Bagian D: Checklist Evaluasi Proses (9 item tetap)
  checklist_evaluasi JSONB NOT NULL DEFAULT '[]',

  -- Bagian E: Hasil Verifikasi Pemahaman
  jumlah_peserta_e INTEGER NOT NULL DEFAULT 0 CHECK (jumlah_peserta_e >= 0),
  jumlah_paham INTEGER NOT NULL DEFAULT 0 CHECK (jumlah_paham >= 0),
  -- persentase_pemahaman = generated column (jumlah_paham / jumlah_peserta_e * 100)
  metode_verifikasi TEXT[] NOT NULL DEFAULT '{}',

  -- Bagian F: Hasil Evaluasi
  hal_baik TEXT NOT NULL DEFAULT '',
  kendala TEXT NOT NULL DEFAULT '',
  rencana_tindak_lanjut TEXT NOT NULL DEFAULT '',

  -- Bagian G: Dokumentasi
  dokumen_checklist TEXT[] NOT NULL DEFAULT '{}',

  -- Tanda Tangan & Pengesahan
  pj_pkrs_nama TEXT NOT NULL DEFAULT '',
  pj_pkrs_nip TEXT NOT NULL DEFAULT '',
  pj_pkrs_ttd_url TEXT,
  penyuluh_nama TEXT NOT NULL DEFAULT '',
  penyuluh_nip TEXT NOT NULL DEFAULT '',
  penyuluh_ttd_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Tabel dokumen upload
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dokumen_upload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  penyuluhan_id UUID NOT NULL REFERENCES public.penyuluhan(id) ON DELETE CASCADE,
  jenis TEXT NOT NULL CHECK (jenis IN (
    'Daftar Hadir', 'Foto Kegiatan', 'Materi Edukasi',
    'Hasil Evaluasi', 'Dokumentasi Lainnya'
  )),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL DEFAULT '',
  file_size INTEGER, -- dalam bytes
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. Trigger: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS penyuluhan_updated_at ON public.penyuluhan;
CREATE TRIGGER penyuluhan_updated_at
  BEFORE UPDATE ON public.penyuluhan
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 5. Row Level Security (RLS)
-- ============================================================

-- Aktifkan RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penyuluhan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen_upload ENABLE ROW LEVEL SECURITY;

-- PROFILES: user hanya bisa lihat & edit profil sendiri
DROP POLICY IF EXISTS "Profil sendiri saja" ON public.profiles;
CREATE POLICY "Profil sendiri saja"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin bisa lihat semua profil
DROP POLICY IF EXISTS "Admin lihat semua profil" ON public.profiles;
CREATE POLICY "Admin lihat semua profil"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PENYULUHAN: Petugas bisa CRUD data sendiri, Admin bisa semua
DROP POLICY IF EXISTS "Petugas CRUD data sendiri" ON public.penyuluhan;
CREATE POLICY "Petugas CRUD data sendiri"
  ON public.penyuluhan
  FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Admin akses semua penyuluhan" ON public.penyuluhan;
CREATE POLICY "Admin akses semua penyuluhan"
  ON public.penyuluhan
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DOKUMEN UPLOAD: ikut akses penyuluhan
DROP POLICY IF EXISTS "Akses dokumen via penyuluhan" ON public.dokumen_upload;
CREATE POLICY "Akses dokumen via penyuluhan"
  ON public.dokumen_upload
  FOR ALL
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

-- ============================================================
-- 6. Supabase Storage Bucket untuk file
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('penyuluhan-files', 'penyuluhan-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: user upload file sendiri
DROP POLICY IF EXISTS "User upload file sendiri" ON storage.objects;
CREATE POLICY "User upload file sendiri"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'penyuluhan-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "User akses file sendiri" ON storage.objects;
CREATE POLICY "User akses file sendiri"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'penyuluhan-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Admin akses semua file" ON storage.objects;
CREATE POLICY "Admin akses semua file"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'penyuluhan-files'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 7. View: ringkasan statistik untuk dashboard
-- ============================================================
CREATE OR REPLACE VIEW public.v_statistik_dashboard AS
SELECT
  DATE_TRUNC('month', hari_tanggal) AS bulan,
  COUNT(*)                          AS jumlah_penyuluhan,
  SUM(jumlah_peserta)               AS total_peserta,
  ROUND(
    AVG(
      CASE
        WHEN jumlah_peserta_e > 0
        THEN (jumlah_paham::DECIMAL / jumlah_peserta_e) * 100
        ELSE 0
      END
    ), 2
  ) AS rata_rata_pemahaman
FROM public.penyuluhan
GROUP BY DATE_TRUNC('month', hari_tanggal)
ORDER BY bulan DESC;

-- Grant akses view ke authenticated users
GRANT SELECT ON public.v_statistik_dashboard TO authenticated;

-- ============================================================
-- SELESAI! Database PKRS siap digunakan.
-- ============================================================
