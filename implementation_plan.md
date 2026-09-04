# Penambahan Fitur Supervisi Bulanan & Audit Indikator Mutu PKRS

Menambahkan dua modul baru ke aplikasi SIPINTAR PKRS berdasarkan formulir resmi RSUD dr. M. Yunus Bengkulu: **Form Supervisi Bulanan PKRS** dan **Form Audit Indikator Mutu PKRS**. Kedua modul ini akan memiliki fitur CRUD, export PDF, dan rekap data — selaras dengan arsitektur yang sudah ada (Next.js 16 + Supabase + TailwindCSS + shadcn).

---

## Prinsip Desain

> [!IMPORTANT]
> **Satu Role untuk Semua.** Tidak ada pembedaan Admin dan Petugas. Semua user yang login memiliki hak akses yang sama — bisa melihat, menambah, mengedit, dan menghapus semua data Supervisi & Audit.

> [!TIP]
> **Simpel & Mudah Digunakan.** Target user dominan berusia lanjut, sehingga:
> - Form menggunakan **multi-section dengan scroll spy navigation** (mengikuti template Form Penyuluhan yang sudah ada — sidebar navigasi section di desktop & horizontal tabs di mobile)
> - Tombol dan teks berukuran **cukup besar** dan mudah dibaca
> - Status disederhanakan menjadi **hanya 2**: `Draft` dan `Selesai`
> - Tidak ada approval flow / verifikasi berlapis
> - Label form dalam **Bahasa Indonesia** yang lugas

---

## User Review Required

> [!IMPORTANT]
> **Dua menu baru akan ditambahkan ke sidebar navigasi:**
> - 📋 **Supervisi Bulanan** — dengan sub-menu: Semua Supervisi, Tambah Supervisi
> - 📊 **Audit Mutu** — dengan sub-menu: Semua Audit, Tambah Audit
>
> Posisi di sidebar: setelah "Laporan" dan sebelum tombol Logout.

> [!WARNING]
> **Database migration baru diperlukan.** Dua tabel baru (`supervisi_bulanan` dan `audit_mutu`) perlu dijalankan di Supabase SQL Editor setelah schema yang sudah ada.

---

## Open Questions

> [!IMPORTANT]
> 1. **Export PDF:** Apakah kedua form ini juga perlu fitur export PDF seperti modul Penyuluhan? Plan ini mengasumsikan **ya** untuk keduanya.
> 2. **Halaman Laporan:** Apakah rekap Supervisi dan Audit digabungkan ke halaman Laporan yang sudah ada, atau masing-masing punya halaman rekap sendiri di dalam sub-menunya? Plan ini mengasumsikan **halaman rekap terpisah** di masing-masing modul.
> 3. **Dashboard:** Apakah dashboard utama perlu menampilkan statistik dari Supervisi & Audit juga? Plan ini mengasumsikan **belum** (bisa ditambahkan nanti).

---

## Proposed Changes

### Database — Supabase Migration

#### [NEW] [schema-supervisi-audit.sql](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/supabase/schema-supervisi-audit.sql)

SQL migration script untuk membuat 2 tabel baru. **Tanpa pembedaan role** — RLS hanya memastikan user sudah login (authenticated), semua user bisa akses semua data.

**Tabel `supervisi_bulanan`:**
| Field | Type | Keterangan |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `created_by` | UUID (FK → auth.users) | Pembuat data (untuk tracking saja, bukan pembatasan akses) |
| `nama_rs` | TEXT | Default: "UPTD Khusus RSUD dr. M. Yunus Bengkulu" |
| `unit_ruang` | TEXT | Unit/Ruang yang disupervisi |
| `bulan_periode` | TEXT | Bulan/Periode supervisi |
| `tanggal_supervisi` | DATE | Tanggal pelaksanaan supervisi |
| `supervisor` | TEXT | Nama supervisor |
| `checklist_supervisi` | JSONB | Array 5 item checklist (Ya/Tidak/NA/Keterangan) |
| `jumlah_item_dinilai` | INTEGER | Auto-calc dari checklist (exclude NA) |
| `jumlah_ya` | INTEGER | Auto-calc dari checklist |
| `jumlah_tidak` | INTEGER | Auto-calc dari checklist |
| `persentase_kepatuhan` | DECIMAL | Jumlah Ya ÷ Jumlah item dinilai × 100% |
| `hasil_kategori` | TEXT | "baik" / "cukup" / "perlu_perbaikan" |
| `temuan_ketidaksesuaian` | TEXT | Temuan/Ketidaksesuaian |
| `hal_sudah_baik` | TEXT | Hal yang sudah baik |
| `tindak_lanjut` | JSONB | Array objek {masalah, tindak_lanjut, pic, target} |
| `kesimpulan` | TEXT | "sesuai" / "perlu_perbaikan" |
| `rekomendasi_supervisor` | TEXT | Rekomendasi teks bebas |
| `supervisor_nama` | TEXT | Nama supervisor (tanda tangan) |
| `supervisor_nip` | TEXT | NIP supervisor |
| `supervisor_ttd_url` | TEXT | URL tanda tangan supervisor |
| `pj_unit_nama` | TEXT | Nama PJ Unit |
| `pj_unit_nip` | TEXT | NIP PJ Unit |
| `pj_unit_ttd_url` | TEXT | URL tanda tangan PJ Unit |
| `status` | TEXT | **Hanya 2 status:** `"draft"` / `"selesai"` |
| `created_at` / `updated_at` | TIMESTAMPTZ | Timestamps |

**5 Item Checklist Supervisi (dalam JSONB):**
1. Kegiatan edukasi/promosi kesehatan dilaksanakan sesuai kebutuhan pasien dan keluarga
2. Materi/media edukasi tersedia dan digunakan dengan baik
3. Pemberian edukasi menggunakan bahasa yang mudah dipahami dan memberikan kesempatan bertanya
4. Pemahaman pasien/keluarga diverifikasi setelah edukasi
5. Pelaksanaan edukasi dan kegiatan PKRS didokumentasikan

**Tabel `audit_mutu`:**
| Field | Type | Keterangan |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `created_by` | UUID (FK → auth.users) | Pembuat data (tracking saja) |
| `periode_audit` | TEXT | Periode audit |
| `bulan` | TEXT | Bulan audit |
| `unit_ruangan` | TEXT | Unit/Ruangan yang diaudit |
| `tanggal_audit` | DATE | Tanggal pelaksanaan audit |
| `auditor` | TEXT | Nama auditor |
| `checklist_audit` | JSONB | Array 8 item indikator mutu |
| `status` | TEXT | **Hanya 2 status:** `"draft"` / `"selesai"` |
| `created_at` / `updated_at` | TIMESTAMPTZ | Timestamps |

**8 Indikator Mutu Audit (dalam JSONB):**
Setiap item memiliki: `{indikator, standar_target, ya, tidak, jumlah_sampel, jumlah_sesuai, capaian, keterangan}`

1. Pasien dilakukan pengkajian kebutuhan informasi dan edukasi (≥80%)
2. Pasien dan keluarga diberikan edukasi sesuai kebutuhan (≥80%)
3. Pasien dan keluarga diberikan media KIE (≥80%)
4. Kepatuhan PPA mengisi Form Edukasi Pasien dan Keluarga Terintegrasi (≥90%)
5. Media edukasi sesuai asesmen kebutuhan (100%)
6. Media edukasi 10 penyakit terbanyak tersedia (100%)
7. Pencapaian kunjungan Instagram sesuai target (≥100%)
8. Pencapaian kunjungan YouTube sesuai target (≥100%)

**RLS Policies (Sederhana):**
- Semua user yang sudah login (`authenticated`) bisa SELECT, INSERT, UPDATE, DELETE pada kedua tabel.
- Tidak ada pembedaan admin/petugas.

---

### Types

#### [NEW] [supervisi.ts](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/types/supervisi.ts)
TypeScript types/interfaces untuk `SupervisiBulanan`, `ChecklistSupervisiItem`, `TindakLanjutItem`.
- Status hanya `'draft' | 'selesai'`

#### [NEW] [audit-mutu.ts](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/types/audit-mutu.ts)
TypeScript types/interfaces untuk `AuditMutu`, `ChecklistAuditItem`.
- Status hanya `'draft' | 'selesai'`

---

### Services (Supabase CRUD)

#### [NEW] [supervisi.service.ts](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/services/supervisi.service.ts)
Service layer untuk operasi CRUD `supervisi_bulanan`:
- `getAll()` — list semua data (tanpa filter per-user, semua user lihat semua)
- `getById(id)` — detail
- `create(data)` — insert
- `update(id, data)` — update
- `delete(id)` — delete

#### [NEW] [audit-mutu.service.ts](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/services/audit-mutu.service.ts)
Service layer untuk operasi CRUD `audit_mutu`:
- `getAll()` — list semua data (tanpa filter per-user)
- `getById(id)` — detail
- `create(data)` — insert
- `update(id, data)` — update
- `delete(id)` — delete

---

### Sidebar Navigation

#### [MODIFY] [Sidebar.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/components/layout/Sidebar.tsx)
- Import icon baru: `Shield` (Supervisi) dan `BarChart3` (Audit Mutu) dari `lucide-react`
- Tambah 2 item baru ke array `navItems`:
  ```ts
  { label: "Supervisi Bulanan", href: "/supervisi", icon: Shield,
    subItems: [
      { label: "Semua Supervisi", href: "/supervisi" },
      { label: "Tambah Supervisi", href: "/supervisi/tambah" },
    ]
  },
  { label: "Audit Mutu", href: "/audit-mutu", icon: BarChart3,
    subItems: [
      { label: "Semua Audit", href: "/audit-mutu" },
      { label: "Tambah Audit", href: "/audit-mutu/tambah" },
    ]
  },
  ```
- Update `bottomNavItems` di `MobileBottomNav` untuk menambahkan entry baru
- Update `MobileTopBar` page title logic

---

### Pages — Supervisi Bulanan (4 routes)

#### [NEW] [page.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/app/(dashboard)/supervisi/page.tsx)
Halaman **list semua supervisi** — tabel data sederhana dengan kolom: Tanggal, Unit/Ruang, Supervisor, Hasil (Baik/Cukup/Perlu Perbaikan), Kepatuhan (%), Status. Filter bulan/periode, pencarian, pagination. Tombol aksi: Lihat, Edit, Hapus, Export PDF. **Semua user melihat semua data.**

#### [NEW] [page.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/app/(dashboard)/supervisi/tambah/page.tsx)
Halaman **form tambah supervisi** — form **multi-section dengan scroll spy navigation** (mengikuti pola FormPenyuluhan: sidebar navigasi section di desktop & horizontal tabs di mobile):
- **Identitas**: Unit/Ruang, Bulan/Periode, Tanggal Supervisi, Supervisor
- **Section A** — Checklist Supervisi (5 item, pilih Ya/Tidak/NA + keterangan)
- **Section B** — Hasil Supervisi (auto-calculated dari checklist)
- **Section C** — Temuan (textarea: ketidaksesuaian + hal sudah baik)
- **Section D** — Tindak Lanjut (dynamic rows: masalah, tindak lanjut, PIC, target)
- **Section E** — Kesimpulan (radio: sesuai/perlu perbaikan) + rekomendasi
- **Section F** — Tanda Tangan (signature pad / upload)
- Tombol simpan: **"Simpan Draft"** dan **"Simpan Selesai"**

#### [NEW] [page.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/app/(dashboard)/supervisi/[id]/page.tsx)
Halaman **detail supervisi** — read-only view dengan tombol Edit & Export PDF.

#### [NEW] [page.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/app/(dashboard)/supervisi/[id]/edit/page.tsx)
Halaman **edit supervisi** — form yang sama dengan tambah, pre-filled dengan data existing.

---

### Pages — Audit Indikator Mutu (4 routes)

#### [NEW] [page.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/app/(dashboard)/audit-mutu/page.tsx)
Halaman **list semua audit** — tabel data sederhana dengan kolom: Tanggal, Unit/Ruangan, Periode, Auditor, Status. Filter bulan/periode, pencarian, pagination. Tombol aksi: Lihat, Edit, Hapus, Export PDF. **Semua user melihat semua data.**

#### [NEW] [page.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/app/(dashboard)/audit-mutu/tambah/page.tsx)
Halaman **form tambah audit** — form **multi-section dengan scroll spy navigation** (mengikuti pola FormPenyuluhan):
- **Identitas**: Periode Audit, Bulan, Unit/Ruangan, Tanggal Audit, Auditor
- **Section A** — Checklist Audit (8 indikator mutu, masing-masing dengan: Ya/Tidak, Jumlah Sampel, Jumlah Sesuai, Capaian auto-calc, Keterangan)
- Tombol simpan: **"Simpan Draft"** dan **"Simpan Selesai"**

#### [NEW] [page.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/app/(dashboard)/audit-mutu/[id]/page.tsx)
Halaman **detail audit** — read-only view dengan tombol Edit & Export PDF.

#### [NEW] [page.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/app/(dashboard)/audit-mutu/[id]/edit/page.tsx)
Halaman **edit audit** — form yang sama dengan tambah, pre-filled dengan data existing.

---

### Components — Supervisi

#### [NEW] [SupervisiForm.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/components/supervisi/SupervisiForm.tsx)
Komponen form reusable (untuk Create & Edit) — **multi-section dengan scroll spy navigation** (mengikuti arsitektur `FormPenyuluhan.tsx`). Mencakup:
- Sidebar navigasi section di desktop & horizontal tabs di mobile
- Input identitas kegiatan (font & input besar, label jelas)
- Checklist supervisi interaktif (5 item, tombol Ya/Tidak/NA yang besar dan mudah diklik)
- Auto-calc hasil supervisi (persentase kepatuhan + kategori, ditampilkan langsung)
- Dynamic rows tindak lanjut
- Signature pad (reuse `react-signature-canvas`)

#### [NEW] [SupervisiTable.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/components/supervisi/SupervisiTable.tsx)
Tabel list supervisi — menampilkan **semua data tanpa filter per-user**. Dengan filter, search, pagination, dan action buttons.

#### [NEW] [SupervisiDetail.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/components/supervisi/SupervisiDetail.tsx)
Komponen detail view read-only.

---

### Components — Audit Mutu

#### [NEW] [AuditMutuForm.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/components/audit-mutu/AuditMutuForm.tsx)
Komponen form reusable (untuk Create & Edit):
- Input identitas audit (font & input besar)
- Tabel checklist 8 indikator mutu (interaktif: tombol Ya/Tidak besar, input angka Jumlah Sampel & Jumlah Sesuai, auto-calc Capaian langsung terlihat)

#### [NEW] [AuditMutuTable.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/components/audit-mutu/AuditMutuTable.tsx)
Tabel list audit — menampilkan **semua data tanpa filter per-user**. Dengan filter, search, pagination, dan action buttons.

#### [NEW] [AuditMutuDetail.tsx](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/components/audit-mutu/AuditMutuDetail.tsx)
Komponen detail view read-only.

---

### Export PDF

#### [NEW] [supervisi-pdf.ts](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/services/export/supervisi-pdf.ts)
Generate PDF untuk Form Supervisi Bulanan menggunakan `jspdf` + `jspdf-autotable`:
- Kop: judul form + nama RS
- Tabel identitas
- Tabel checklist supervisi (Ya/Tidak/NA/Keterangan)
- Hasil supervisi (persentase & kategori)
- Temuan & hal sudah baik
- Tabel tindak lanjut
- Kesimpulan & rekomendasi
- Area tanda tangan

#### [NEW] [audit-mutu-pdf.ts](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/services/export/audit-mutu-pdf.ts)
Generate PDF untuk Form Audit Indikator Mutu menggunakan `jspdf` + `jspdf-autotable`:
- Kop: judul form + nama RS
- Tabel identitas
- Tabel checklist 8 indikator (No, Indikator, Standar/Target, Ya/Tidak, Jumlah Sampel, Jumlah Sesuai, Capaian, Keterangan)

---

### Export Excel

#### [NEW] [supervisi-excel.ts](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/services/export/supervisi-excel.ts)
Generate rekap Excel supervisi bulanan (filtered) dengan kolom: No, Tanggal, Unit/Ruang, Supervisor, Kepatuhan (%), Kategori Hasil, Kesimpulan, Status.

#### [NEW] [audit-mutu-excel.ts](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/services/export/audit-mutu-excel.ts)
Generate rekap Excel audit mutu (filtered) dengan kolom: No, Tanggal, Unit/Ruangan, Periode, Auditor, dan capaian per indikator, Status.

---

### Middleware

#### [MODIFY] [middleware.ts](file:///d:/Web%20Penyuluhan/penyuluhan-pkrs/middleware.ts)
Tambahkan routes `/supervisi` dan `/audit-mutu` ke protected routes matcher agar terlindungi oleh autentikasi (hanya perlu login, tidak ada cek role).

---

## Ringkasan File Baru & Modifikasi

| Kategori | File | Aksi |
|---|---|---|
| **Database** | `supabase/schema-supervisi-audit.sql` | NEW |
| **Types** | `types/supervisi.ts` | NEW |
| **Types** | `types/audit-mutu.ts` | NEW |
| **Services** | `services/supervisi.service.ts` | NEW |
| **Services** | `services/audit-mutu.service.ts` | NEW |
| **Services** | `services/export/supervisi-pdf.ts` | NEW |
| **Services** | `services/export/audit-mutu-pdf.ts` | NEW |
| **Services** | `services/export/supervisi-excel.ts` | NEW |
| **Services** | `services/export/audit-mutu-excel.ts` | NEW |
| **Components** | `components/supervisi/SupervisiForm.tsx` | NEW |
| **Components** | `components/supervisi/SupervisiTable.tsx` | NEW |
| **Components** | `components/supervisi/SupervisiDetail.tsx` | NEW |
| **Components** | `components/audit-mutu/AuditMutuForm.tsx` | NEW |
| **Components** | `components/audit-mutu/AuditMutuTable.tsx` | NEW |
| **Components** | `components/audit-mutu/AuditMutuDetail.tsx` | NEW |
| **Pages** | `app/(dashboard)/supervisi/page.tsx` | NEW |
| **Pages** | `app/(dashboard)/supervisi/tambah/page.tsx` | NEW |
| **Pages** | `app/(dashboard)/supervisi/[id]/page.tsx` | NEW |
| **Pages** | `app/(dashboard)/supervisi/[id]/edit/page.tsx` | NEW |
| **Pages** | `app/(dashboard)/audit-mutu/page.tsx` | NEW |
| **Pages** | `app/(dashboard)/audit-mutu/tambah/page.tsx` | NEW |
| **Pages** | `app/(dashboard)/audit-mutu/[id]/page.tsx` | NEW |
| **Pages** | `app/(dashboard)/audit-mutu/[id]/edit/page.tsx` | NEW |
| **Layout** | `components/layout/Sidebar.tsx` | MODIFY |
| **Middleware** | `middleware.ts` | MODIFY |

**Total: 24 file baru, 2 file dimodifikasi**

---

## Verification Plan

### Automated Tests
- Tidak ada test framework yang terpasang saat ini, verifikasi akan dilakukan secara manual.

### Manual Verification
1. **Build check**: `npm run build` harus berhasil tanpa error
2. **Navigation**: Kedua menu baru muncul di sidebar (desktop & mobile) dengan sub-menu yang benar
3. **CRUD Supervisi**: Test create, read, update, delete data supervisi
4. **CRUD Audit**: Test create, read, update, delete data audit mutu
5. **Akses data**: Semua user yang login bisa lihat & kelola semua data (tanpa pembatasan role)
6. **Auto-calculation**: Persentase kepatuhan (Supervisi) dan Capaian (Audit) terhitung otomatis
7. **Export PDF**: PDF dihasilkan sesuai layout form resmi untuk kedua modul
8. **Export Excel**: File .xlsx dihasilkan dengan data yang benar untuk kedua modul
9. **Responsive**: Layout bekerja dengan baik di desktop, tablet, dan mobile
