// types/supervisi.ts

export type StatusSupervisi = 'draft' | 'selesai';
export type HasilKategori = 'baik' | 'cukup' | 'perlu_perbaikan';
export type NilaiChecklist = 'ya' | 'tidak' | 'na';
export type KesimpulanSupervisi = 'sesuai' | 'perlu_perbaikan';

export interface ChecklistSupervisiItem {
  id: number;
  label: string;
  nilai: NilaiChecklist | null;
  keterangan: string;
}

export interface TindakLanjutItem {
  id: string;
  masalah: string;
  tindak_lanjut: string;
  pic: string;
  target: string;
}

export interface SupervisiBulanan {
  id: string;
  created_by: string | null;
  nama_rs: string;
  unit_ruang: string;
  bulan_periode: string;
  tanggal_supervisi: string | null;
  supervisor: string;

  checklist_supervisi: ChecklistSupervisiItem[];

  jumlah_item_dinilai: number;
  jumlah_ya: number;
  jumlah_tidak: number;
  persentase_kepatuhan: number;
  hasil_kategori: HasilKategori;

  temuan_ketidaksesuaian: string;
  hal_sudah_baik: string;

  tindak_lanjut: TindakLanjutItem[];

  kesimpulan: KesimpulanSupervisi;
  rekomendasi_supervisor: string;

  supervisor_nama: string;
  supervisor_nip: string;
  supervisor_ttd_url: string;
  pj_unit_nama: string;
  pj_unit_nip: string;
  pj_unit_ttd_url: string;

  status: StatusSupervisi;
  created_at: string;
  updated_at: string;
}

// 5 item checklist default
export const DEFAULT_CHECKLIST_SUPERVISI: ChecklistSupervisiItem[] = [
  {
    id: 1,
    label: 'Kegiatan edukasi/promosi kesehatan dilaksanakan sesuai kebutuhan pasien dan keluarga',
    nilai: null,
    keterangan: '',
  },
  {
    id: 2,
    label: 'Materi/media edukasi tersedia dan digunakan dengan baik',
    nilai: null,
    keterangan: '',
  },
  {
    id: 3,
    label: 'Pemberian edukasi menggunakan bahasa yang mudah dipahami dan memberikan kesempatan bertanya',
    nilai: null,
    keterangan: '',
  },
  {
    id: 4,
    label: 'Pemahaman pasien/keluarga diverifikasi setelah edukasi',
    nilai: null,
    keterangan: '',
  },
  {
    id: 5,
    label: 'Pelaksanaan edukasi dan kegiatan PKRS didokumentasikan',
    nilai: null,
    keterangan: '',
  },
];
