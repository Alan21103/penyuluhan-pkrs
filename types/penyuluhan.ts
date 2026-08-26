// Tipe data untuk Formulir Pelaksanaan Penyuluhan Kelompok PKRS

export type StatusPenyuluhan = "draft" | "selesai";

export type MetodePenyuluhan =
  | "Ceramah"
  | "Diskusi"
  | "Demonstrasi"
  | "Simulasi"
  | "Praktik";

export type MediaPenyuluhan =
  | "Leaflet"
  | "Poster"
  | "PPT"
  | "Video"
  | "Alat Peraga"
  | "Lainnya";

export type MetodeVerifikasi =
  | "Teach Back"
  | "Tanya Jawab"
  | "Post-test"
  | "Demonstrasi"
  | "Praktik Langsung";

export type JenisDokumen =
  | "Daftar Hadir"
  | "Foto Kegiatan"
  | "Materi Edukasi"
  | "Hasil Evaluasi"
  | "Dokumentasi Lainnya";

// Item checklist evaluasi proses (Bagian D)
export interface ChecklistItem {
  item: string;
  ya: boolean;
  tidak: boolean;
  keterangan: string;
}

export const CHECKLIST_ITEMS_DEFAULT: ChecklistItem[] = [
  { item: "Tujuan penyuluhan disampaikan", ya: false, tidak: false, keterangan: "" },
  { item: "Materi sesuai kebutuhan peserta", ya: false, tidak: false, keterangan: "" },
  { item: "Bahasa mudah dipahami", ya: false, tidak: false, keterangan: "" },
  { item: "Media edukasi digunakan", ya: false, tidak: false, keterangan: "" },
  { item: "Peserta diberi kesempatan bertanya", ya: false, tidak: false, keterangan: "" },
  { item: "Diskusi/tanya jawab dilakukan", ya: false, tidak: false, keterangan: "" },
  { item: "Verifikasi pemahaman dilakukan", ya: false, tidak: false, keterangan: "" },
  { item: "Evaluasi dilakukan", ya: false, tidak: false, keterangan: "" },
  { item: "Peserta menerima pesan kunci", ya: false, tidak: false, keterangan: "" },
];

// Tipe utama data penyuluhan
export interface Penyuluhan {
  id: string;
  created_by: string;
  status: StatusPenyuluhan;

  // Bagian A — Identitas Kegiatan
  hari_tanggal: string; // format: YYYY-MM-DD
  waktu_mulai: string;  // format: HH:MM
  waktu_selesai: string;
  tempat: string;
  topik: string;
  sasaran: string;
  jumlah_peserta: number;
  penyuluh: string[];
  unit_instansi: string;
  durasi: number; // dalam menit
  metode: MetodePenyuluhan[];
  media: MediaPenyuluhan[];
  media_lainnya?: string;

  // Bagian B — Tujuan Penyuluhan
  tujuan_penyuluhan: string[];

  // Bagian C — Materi yang Disampaikan
  materi_disampaikan: string[];

  // Bagian D — Pelaksanaan (Checklist)
  checklist_evaluasi: ChecklistItem[];

  // Bagian E — Hasil Verifikasi Pemahaman
  jumlah_peserta_e: number;
  jumlah_paham: number;
  // persentase_pemahaman dihitung: (jumlah_paham / jumlah_peserta_e) * 100
  metode_verifikasi: MetodeVerifikasi[];

  // Bagian F — Hasil Evaluasi
  hal_baik: string;
  kendala: string;
  rencana_tindak_lanjut: string;

  // Bagian G — Dokumentasi
  dokumen_checklist: JenisDokumen[];

  // Tanda Tangan & Pengesahan
  pj_pkrs_nama: string;
  pj_pkrs_nip: string;
  pj_pkrs_ttd_url?: string;
  penyuluh_nama: string;
  penyuluh_nip: string;
  penyuluh_ttd_url?: string;

  created_at: string;
  updated_at: string;
}

// Tipe untuk upload dokumen
export interface DokumenUpload {
  id: string;
  penyuluhan_id: string;
  jenis: JenisDokumen;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

// Tipe untuk statistik dashboard
export interface DashboardStats {
  total_penyuluhan_bulan_ini: number;
  total_peserta_bulan_ini: number;
  rata_rata_pemahaman: number;
}

// Tipe untuk data chart
export interface ChartDataPoint {
  bulan: string;
  jumlah_penyuluhan: number;
  rata_rata_pemahaman: number;
}

// Tipe untuk user/petugas
export interface UserProfile {
  id: string;
  email: string;
  nama: string;
  nip?: string;
  role: "admin" | "petugas";
  unit?: string;
}
