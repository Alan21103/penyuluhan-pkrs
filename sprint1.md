Buatkan saya aplikasi web untuk mengelola Formulir Pelaksanaan Penyuluhan Kelompok PKRS (Promosi Kesehatan Rumah Sakit), dengan spesifikasi berikut:

1. Tujuan Aplikasi

Aplikasi digunakan oleh tim PKRS rumah sakit untuk mengisi formulir pelaksanaan penyuluhan kelompok (CRUD), mencetak dokumen formulir per kegiatan dalam format PDF sesuai layout form resmi, serta membuat laporan rekap seluruh kegiatan penyuluhan dalam format Excel yang bisa difilter per tanggal atau per bulan.

2. Autentikasi
Login untuk petugas (email & password).
Role: Admin (Penanggung Jawab PKRS — bisa kelola & verifikasi semua data) dan Petugas/Penyuluh (input data kegiatan sendiri).
3. Modul CRUD — Formulir Penyuluhan

Buat tabel utama penyuluhan dengan struktur field mengikuti form asli, dibagi per bagian:

A. Identitas Kegiatan

Field	Tipe
Hari/Tanggal	Date
Waktu (mulai–selesai)	Time range
Tempat	Text
Topik	Text
Sasaran	Text
Jumlah Peserta	Number
Penyuluh	Text (bisa multi, pisahkan dengan tag/chip input)
Unit/Instansi	Text
Durasi	Text/Number (menit)
Metode	Multi-select: Ceramah, Diskusi, Demonstrasi, Simulasi, Praktik
Media	Multi-select: Leaflet, Poster, PPT, Video, Alat Peraga, Lainnya (dengan input teks bila "Lainnya")

B. Tujuan Penyuluhan

Daftar poin tujuan (dynamic list, bisa tambah/hapus baris — user isi bebas, minimal 1 poin).

C. Materi yang Disampaikan

Daftar poin materi (dynamic list, sama seperti Tujuan Penyuluhan).

D. Pelaksanaan (checklist evaluasi proses) Tabel checklist dengan kolom Ya / Tidak / Keterangan untuk 9 item tetap:

Tujuan penyuluhan disampaikan
Materi sesuai kebutuhan peserta
Bahasa mudah dipahami
Media edukasi digunakan
Peserta diberi kesempatan bertanya
Diskusi/tanya jawab dilakukan
Verifikasi pemahaman dilakukan
Evaluasi dilakukan
Peserta menerima pesan kunci

E. Hasil Verifikasi Pemahaman

Field	Tipe
Jumlah peserta	Number
Jumlah peserta yang dapat menjelaskan kembali materi	Number
Persentase pemahaman	Auto-calculated (jumlah paham ÷ jumlah peserta × 100%), tampilkan read-only
Metode verifikasi	Multi-select: Teach Back, Tanya Jawab, Post-test, Demonstrasi, Praktik Langsung

F. Hasil Evaluasi

Hal yang sudah baik (textarea)
Kendala (textarea)
Rencana tindak lanjut (textarea)

G. Dokumentasi

Checklist jenis dokumen: Daftar Hadir, Foto Kegiatan, Materi Edukasi, Hasil Evaluasi, Dokumentasi Lainnya
Upload file/gambar untuk masing-masing jenis dokumentasi yang dicentang (multi-upload, simpan ke storage)

Tanda Tangan & Pengesahan

Penanggung Jawab PKRS: Nama, NIP, tanda tangan (upload gambar tanda tangan atau signature pad)
Penyuluh: Nama, NIP, tanda tangan (upload gambar tanda tangan atau signature pad)

Fitur CRUD:

Create: form multi-step/multi-section mengikuti urutan A–G di atas, dengan validasi field wajib (terutama bagian A).
Read: halaman daftar (list) dalam tabel, kolom utama: Tanggal, Topik, Tempat, Penyuluh, Sasaran, Status. Ada pencarian dan pagination.
Update: edit data yang sudah diinput, termasuk status (Draft/Selesai/Terverifikasi).
Delete: hapus data dengan modal konfirmasi.
4. Export PDF (per dokumen)
Tombol "Export PDF" pada setiap entri, menghasilkan dokumen PDF yang re-create layout formulir asli:
Kop: "Formulir Pelaksanaan Penyuluhan Kelompok — Promosi Kesehatan Rumah Sakit (PKRS)" beserta nama & logo rumah sakit.
Bagian A dalam bentuk tabel bernomor.
Bagian B & C dalam bentuk poin bernomor.
Bagian D dalam bentuk tabel checklist (Ya/Tidak/Keterangan).
Bagian E, F, G ditampilkan sesuai isian.
Bagian tanda tangan Penanggung Jawab PKRS dan Penyuluh di bagian bawah (tampilkan gambar tanda tangan yang diupload, atau kolom kosong bila belum diisi).
Gunakan jspdf + jspdf-autotable (untuk tabel) atau react-pdf untuk generate PDF di client-side.
5. Export Excel (laporan rekap)
Halaman "Laporan" terpisah menampilkan rekap seluruh kegiatan penyuluhan dalam tabel.
Filter di bagian atas:
Filter per tanggal (date range: dari–sampai).
Filter per bulan (pilih bulan & tahun).
Tombol "Export Excel" mengunduh hasil filter dalam format .xlsx dengan kolom: No, Hari/Tanggal, Waktu, Tempat, Topik, Sasaran, Jumlah Peserta, Penyuluh, Unit/Instansi, Metode, Persentase Pemahaman, Status.
Gunakan library xlsx (SheetJS) untuk generate file Excel di client-side.
6. Dashboard
Ringkasan: total penyuluhan bulan ini, total peserta, rata-rata persentase pemahaman peserta.
Grafik sederhana: jumlah penyuluhan per bulan, dan rata-rata persentase pemahaman per bulan (line/bar chart).
7. Desain UI
Tema warna bersih & profesional (nuansa biru/putih khas rumah sakit).
Layout responsif (desktop & tablet/HP untuk petugas lapangan).
Sidebar navigasi: Dashboard, Data Penyuluhan, Laporan, Logout.
Form input dibuat per-section (accordion atau stepper) mengikuti urutan A–G agar tidak terlalu panjang dalam satu scroll.
8. Database
Gunakan Supabase (sudah terintegrasi dengan Lovable) untuk autentikasi, tabel data penyuluhan, dan penyimpanan file (foto, dokumen, tanda tangan) di Supabase Storage.

Catatan tambahan yang bisa ditambahkan ke prompt bila perlu:

Approval flow: status "Draft" → "Diajukan" → "Diverifikasi Penanggung Jawab PKRS" sebelum PDF final bisa dicetak.
Riwayat revisi (jika formulir sering direvisi setelah diverifikasi).
Signature pad digital (misal react-signature-canvas) sebagai alternatif upload gambar tanda tangan.