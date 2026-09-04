-- ============================================================
-- SIPINTAR PKRS — Supervisi Bulanan & Audit Indikator Mutu
-- Migration Script — Jalankan di Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────
-- 1. Tabel: supervisi_bulanan
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supervisi_bulanan (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nama_rs                  TEXT NOT NULL DEFAULT 'UPTD Khusus RSUD dr. M. Yunus Bengkulu',
  unit_ruang               TEXT NOT NULL DEFAULT '',
  bulan_periode            TEXT NOT NULL DEFAULT '',
  tanggal_supervisi        DATE,
  supervisor               TEXT NOT NULL DEFAULT '',

  -- Checklist 5 item (JSONB array of objects)
  -- [{ id, label, nilai: 'ya'|'tidak'|'na', keterangan }]
  checklist_supervisi      JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Hasil auto-calc (bisa diisi FE, atau dikompute via trigger)
  jumlah_item_dinilai      INTEGER NOT NULL DEFAULT 0,
  jumlah_ya                INTEGER NOT NULL DEFAULT 0,
  jumlah_tidak             INTEGER NOT NULL DEFAULT 0,
  persentase_kepatuhan     DECIMAL(5,2) NOT NULL DEFAULT 0,
  hasil_kategori           TEXT NOT NULL DEFAULT 'perlu_perbaikan'
                             CHECK (hasil_kategori IN ('baik','cukup','perlu_perbaikan')),

  -- Temuan
  temuan_ketidaksesuaian   TEXT NOT NULL DEFAULT '',
  hal_sudah_baik           TEXT NOT NULL DEFAULT '',

  -- Tindak lanjut dynamic rows
  -- [{ id, masalah, tindak_lanjut, pic, target }]
  tindak_lanjut            JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Kesimpulan & Rekomendasi
  kesimpulan               TEXT NOT NULL DEFAULT 'sesuai'
                             CHECK (kesimpulan IN ('sesuai','perlu_perbaikan')),
  rekomendasi_supervisor   TEXT NOT NULL DEFAULT '',

  -- Tanda Tangan
  supervisor_nama          TEXT NOT NULL DEFAULT '',
  supervisor_nip           TEXT NOT NULL DEFAULT '',
  supervisor_ttd_url       TEXT NOT NULL DEFAULT '',
  pj_unit_nama             TEXT NOT NULL DEFAULT '',
  pj_unit_nip              TEXT NOT NULL DEFAULT '',
  pj_unit_ttd_url          TEXT NOT NULL DEFAULT '',

  -- Status
  status                   TEXT NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft','selesai')),

  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS supervisi_bulanan_updated_at ON public.supervisi_bulanan;
CREATE TRIGGER supervisi_bulanan_updated_at
  BEFORE UPDATE ON public.supervisi_bulanan
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: Semua authenticated user bisa akses semua data
ALTER TABLE public.supervisi_bulanan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_supervisi" ON public.supervisi_bulanan;
CREATE POLICY "authenticated_all_supervisi" ON public.supervisi_bulanan
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────
-- 2. Tabel: audit_mutu
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_mutu (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  periode_audit    TEXT NOT NULL DEFAULT '',
  bulan            TEXT NOT NULL DEFAULT '',
  unit_ruangan     TEXT NOT NULL DEFAULT '',
  tanggal_audit    DATE,
  auditor          TEXT NOT NULL DEFAULT '',

  -- Checklist 8 indikator mutu (JSONB array of objects)
  -- [{ id, indikator, standar_target, ya, tidak, jumlah_sampel, jumlah_sesuai, capaian, keterangan }]
  checklist_audit  JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Status
  status           TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','selesai')),

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS audit_mutu_updated_at ON public.audit_mutu;
CREATE TRIGGER audit_mutu_updated_at
  BEFORE UPDATE ON public.audit_mutu
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: Semua authenticated user bisa akses semua data
ALTER TABLE public.audit_mutu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_audit" ON public.audit_mutu;
CREATE POLICY "authenticated_all_audit" ON public.audit_mutu
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
