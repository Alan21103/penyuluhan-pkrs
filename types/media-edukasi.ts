// types/media-edukasi.ts

export type StatusMediaEdukasi = 'draft' | 'selesai';

export interface MediaEdukasiItem {
  id: string;
  tanggal_nomor: string;
  jenis_media: string;
  bentuk_media: string;
  judul_materi: string;
  lokasi_platform: string;
  jumlah_distribusi: number;
  sasaran: string;
}

export interface LaporanMediaEdukasi {
  id: string;
  created_by: string | null;
  periode_bulan: string;
  tahun: string;
  penanggung_jawab: string;
  petugas_pelaporan: string;
  items: MediaEdukasiItem[];
  status: StatusMediaEdukasi;
  created_at: string;
  updated_at: string;
}

export const JENIS_MEDIA_OPTIONS = [
  'Leaflet',
  'Pamflet',
  'Video Layanan',
  'Video Edukasi',
  'Video Kolaborasi',
  'Video Kreatif',
] as const;

export const BENTUK_MEDIA_OPTIONS = ['Cetak', 'Elektronik', 'Massa'] as const;

export const LOKASI_PLATFORM_OPTIONS = [
  'Ruang Rawat Inap',
  'Poliklinik Rawat Jalan',
  'TV RS',
  'Instagram',
  'TikTok',
  'YouTube',
  'QR Code/Website',
  'Lainnya',
] as const;

export const SASARAN_OPTIONS = [
  'Pasien/Keluarga',
  'Pasien/Pengunjung',
  'Masyarakat',
  'Lainnya',
] as const;
