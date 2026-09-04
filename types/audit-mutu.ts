// types/audit-mutu.ts

export type StatusAudit = 'draft' | 'selesai';

export interface ChecklistAuditItem {
  id: number;
  indikator: string;
  standar_target: string;
  ya: boolean | null;
  tidak: boolean | null;
  jumlah_sampel: number;
  jumlah_sesuai: number;
  capaian: number; // auto-calc: jumlah_sesuai / jumlah_sampel * 100
  keterangan: string;
}

export interface AuditMutu {
  id: string;
  created_by: string | null;
  periode_audit: string;
  bulan: string;
  unit_ruangan: string;
  tanggal_audit: string | null;
  auditor: string;
  checklist_audit: ChecklistAuditItem[];
  status: StatusAudit;
  created_at: string;
  updated_at: string;
}

// 8 Indikator Mutu default
export const DEFAULT_CHECKLIST_AUDIT: ChecklistAuditItem[] = [
  {
    id: 1,
    indikator: 'Pasien dilakukan pengkajian kebutuhan informasi dan edukasi',
    standar_target: '≥ 80%',
    ya: null,
    tidak: null,
    jumlah_sampel: 0,
    jumlah_sesuai: 0,
    capaian: 0,
    keterangan: '',
  },
  {
    id: 2,
    indikator: 'Pasien dan keluarga diberikan edukasi sesuai kebutuhan',
    standar_target: '≥ 80%',
    ya: null,
    tidak: null,
    jumlah_sampel: 0,
    jumlah_sesuai: 0,
    capaian: 0,
    keterangan: '',
  },
  {
    id: 3,
    indikator: 'Pasien dan keluarga diberikan media KIE',
    standar_target: '≥ 80%',
    ya: null,
    tidak: null,
    jumlah_sampel: 0,
    jumlah_sesuai: 0,
    capaian: 0,
    keterangan: '',
  },
  {
    id: 4,
    indikator: 'Kepatuhan PPA mengisi Form Edukasi Pasien dan Keluarga Terintegrasi',
    standar_target: '≥ 90%',
    ya: null,
    tidak: null,
    jumlah_sampel: 0,
    jumlah_sesuai: 0,
    capaian: 0,
    keterangan: '',
  },
  {
    id: 5,
    indikator: 'Media edukasi sesuai asesmen kebutuhan',
    standar_target: '100%',
    ya: null,
    tidak: null,
    jumlah_sampel: 0,
    jumlah_sesuai: 0,
    capaian: 0,
    keterangan: '',
  },
  {
    id: 6,
    indikator: 'Media edukasi 10 penyakit terbanyak tersedia',
    standar_target: '100%',
    ya: null,
    tidak: null,
    jumlah_sampel: 0,
    jumlah_sesuai: 0,
    capaian: 0,
    keterangan: '',
  },
  {
    id: 7,
    indikator: 'Pencapaian kunjungan Instagram sesuai target',
    standar_target: '≥ 100%',
    ya: null,
    tidak: null,
    jumlah_sampel: 0,
    jumlah_sesuai: 0,
    capaian: 0,
    keterangan: '',
  },
  {
    id: 8,
    indikator: 'Pencapaian kunjungan YouTube sesuai target',
    standar_target: '≥ 100%',
    ya: null,
    tidak: null,
    jumlah_sampel: 0,
    jumlah_sesuai: 0,
    capaian: 0,
    keterangan: '',
  },
];
