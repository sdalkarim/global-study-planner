# Global Study Planner

Buat sebuah aplikasi web lengkap untuk "Form Konsultasi Persiapan Kuliah ke Luar Negeri" yang terdiri dari:

1. Halaman form untuk peserta

2. Database untuk menyimpan seluruh data peserta

3. Admin login

4. Dashboard admin untuk melihat, mencari, memfilter, mengedit, menghapus, dan export data peserta

==================================================

1. TUJUAN APLIKASI

==================================================

Aplikasi digunakan untuk mengumpulkan data siswa, mahasiswa, fresh graduate, pekerja, dan orang tua yang ingin mendapatkan informasi, arahan, dan rekomendasi terkait persiapan kuliah ke luar negeri.

Fokus aplikasi adalah pemetaan profil peserta dan kebutuhan persiapan kuliah ke luar negeri.

Jangan tambahkan pertanyaan:

- "Mau Datang ke Event yang Mana?"

- Pilihan sesi/event/session.

==================================================

2. DESAIN

==================================================

Gunakan desain yang:

- Modern

- Premium

- Profesional

- Bersih

- Elegan

- Terpercaya

- Mobile responsive

Target pengguna:

- Siswa

- Mahasiswa

- Fresh graduate

- Pekerja

- Orang tua

Gunakan layout berbasis card/section agar form mudah dipahami.

Gunakan progress indicator pada form agar pengguna mengetahui progres pengisian.

Gunakan tombol:

- "Lanjutkan"

- "Kembali"

- "Kirim Formulir"

Gunakan validasi untuk seluruh field wajib.

==================================================

3. HALAMAN FORM PESERTA

==================================================

Buat halaman utama:

/form

HEADER / INTRO:

Judul:

"Persiapan Kuliah ke Luar Negeri Dimulai dari Sekarang"

Deskripsi:

"Kuliah ke luar negeri bukan hanya tentang memilih universitas atau negara tujuan. Persiapan yang tepat perlu dimulai sejak dini, mulai dari menentukan jurusan, memilih negara tujuan, memahami persyaratan masuk, mempersiapkan kemampuan bahasa, hingga mencari peluang beasiswa.

Melalui form ini, kami ingin memahami profil dan rencana studi Anda agar dapat memberikan informasi, arahan, dan rekomendasi yang sesuai dengan kebutuhan persiapan kuliah ke luar negeri.

Silakan isi data berikut dengan lengkap dan sesuai kondisi Anda."

==================================================

SECTION 1 — DATA PESERTA

==================================================

1. Nama Lengkap

- Type: text

- Required: yes

2. Nomor WhatsApp

- Type: tel

- Required: yes

3. Email Aktif

- Type: email

- Required: yes

==================================================

SECTION 2 — MINAT STUDI

==================================================

4. Program yang Anda Minati

- Type: radio/select

- Required: yes

Options:

- Study Abroad (Kuliah di Luar Negeri)

- STYLE – International Exchange Program

5. Jenjang Studi yang Dituju

- Type: radio/select

- Required: yes

Options:

- S1 (Bachelor's Degree)

- S2/S3 (Master's / PhD)

6. Saya Mendaftar Sebagai

- Type: radio

- Required: yes

Options:

- Siswa / Hunters

- Orang Tua

==================================================

SECTION 3 — STATUS PENDIDIKAN SAAT INI

==================================================

7. Status Anda Saat Ini

- Type: select

- Required: yes

Options:

- SMP / Sederajat

- SMA / MA

- SMK

- Gap Year

- Mahasiswa

- Fresh Graduate S1

- Fresh Graduate S2

- Pekerja

- Sedang Tidak Bekerja

Gunakan conditional logic:

Jika memilih:

- SMP/SMA/SMK → tampilkan Kelas

- Gap Year → tampilkan Tahun Lulus

- Mahasiswa → tampilkan Semester

- Pekerja → tampilkan informasi pekerjaan

==================================================

SECTION 4 — DATA ORANG TUA / WALI

==================================================

8. Nama Orang Tua / Wali

- Type: text

- Required: yes

9. Nomor WhatsApp Orang Tua / Wali

- Type: tel

- Required: yes

10. Pekerjaan Orang Tua / Wali

- Type: select

Options:

- Belum/Tidak Bekerja

- Mengurus Rumah Tangga

- Petani

- Nelayan

- Peternak

- Pegawai Negeri

- TNI / POLRI

- Karyawan Swasta

- Pengusaha

- Tenaga Pengajar

- Dokter

- Akuntan

- Arsitek

- Pengacara

- BUMN / BUMD

- Pekerjaan Lainnya

11. Jika memilih "Pekerjaan Lainnya"

- Type: text

- Conditional: hanya tampil jika memilih Pekerjaan Lainnya

==================================================

SECTION 5 — DATA PENDIDIKAN

==================================================

12. Nama Sekolah / Universitas / Instansi

- Type: text

- Required: yes

13. Kelas

- Type: select

- Conditional: hanya untuk SMP/SMA/SMK

Options:

- Kelas 7

- Kelas 8

- Kelas 9

- Kelas 10

- Kelas 11

- Kelas 12

14. Semester

- Type: select

- Conditional: hanya untuk Mahasiswa

Options:

- Semester 1

- Semester 2

- Semester 3

- Semester 4

- Semester 5

- Semester 6

- Semester 7

- Semester 8+

15. Tahun Lulus

- Type: number/select

- Conditional: hanya untuk Gap Year

16. Sudah Bekerja Berapa Lama?

- Type: select

- Conditional: hanya untuk Pekerja

Options:

- Kurang dari 2 tahun

- 2 tahun atau lebih

17. Masa Bekerja di Pekerjaan Terakhir

- Type: select

- Conditional: hanya untuk Pekerja

Options:

- Kurang dari 1 tahun

- 1–2 tahun

- 3–5 tahun

- Lebih dari 5 tahun

- Belum Pernah Bekerja

18. Bidang Pekerjaan

- Type: text/select

- Conditional: hanya untuk Pekerja

==================================================

SECTION 6 — RENCANA STUDI KE LUAR NEGERI

==================================================

19. Kapan Anda Berencana Memulai Kuliah di Luar Negeri?

- Type: radio/select

- Required: yes

Options:

- Kurang dari 1 tahun

- 1–2 tahun

- 2–3 tahun

- 3–4 tahun

- Lebih dari 4 tahun

20. Negara Tujuan yang Diminati

- Type: text

- Required: yes

- Allow multiple countries

21. Program Studi / Jurusan yang Diminati

- Type: text

- Required: yes

22. Rencana Pembiayaan Studi

- Type: checkbox

- Allow multiple selections

Options:

- Fully Funded (Beasiswa Penuh)

- Partially Funded (Beasiswa Sebagian)

- Self Funded (Biaya Mandiri)

==================================================

SECTION 7 — PERSETUJUAN

==================================================

Tampilkan checkbox wajib:

"Saya menyatakan bahwa data yang diberikan benar dan bersedia dihubungi untuk mendapatkan informasi, konsultasi, serta rekomendasi program persiapan kuliah ke luar negeri sesuai kebutuhan saya."

Checkbox:

"Saya menyetujui"

User tidak dapat mengirim formulir sebelum checkbox dicentang.

==================================================

4. SUBMIT FORM

==================================================

Setelah peserta menekan "Kirim Formulir":

- Validasi seluruh field wajib.

- Simpan data ke database.

- Tampilkan loading state.

- Jika berhasil, tampilkan halaman sukses.

Halaman sukses:

Judul:

"Terima Kasih!"

Pesan:

"Data Anda telah berhasil dikirim. Tim kami akan menghubungi Anda untuk memberikan informasi dan arahan terkait persiapan kuliah ke luar negeri."

Tambahkan tombol:

"Kembali ke Beranda"

==================================================

5. DATABASE

==================================================

Jika project menggunakan Supabase, gunakan Supabase sebagai database utama.

Buat tabel:

applications

Field:

- id

- full_name

- whatsapp

- email

- program_interest

- study_level

- applicant_type

- current_status

- school_university

- class

- semester

- graduation_year

- work_duration

- last_work_duration

- work_field

- parent_name

- parent_whatsapp

- parent_occupation

- parent_occupation_other

- intake_plan

- destination_country

- intended_major

- funding_preference

- consent

- created_at

- updated_at

Gunakan timestamp otomatis untuk:

- created_at

- updated_at

==================================================

6. ADMIN LOGIN

==================================================

Buat halaman:

/admin/login

Dashboard admin hanya dapat diakses setelah login.

Gunakan authentication yang aman.

Jika menggunakan Supabase:

- Gunakan Supabase Auth.

- Jangan simpan password secara manual/plaintext.

- Terapkan authentication dan authorization.

- Gunakan Row Level Security (RLS).

Peserta umum tidak boleh mengakses dashboard admin.

Jika user belum login dan membuka:

/admin

redirect ke:

/admin/login

==================================================

7. ADMIN DASHBOARD

==================================================

Buat halaman:

/admin

Judul:

"Dashboard Pendaftar"

Subtitle:

"Data Peserta Konsultasi Persiapan Kuliah ke Luar Negeri"

Gunakan layout dashboard modern dengan sidebar.

SIDEBAR:

- Dashboard

- Pendaftar

- Export Data

- Pengaturan

- Logout

==================================================

8. SUMMARY CARDS

==================================================

Di bagian atas dashboard tampilkan:

1. Total Pendaftar

2. Pendaftar S1

3. Pendaftar S2/S3

4. Pendaftar dengan rencana kuliah < 1 Tahun

5. Pendaftar Fully Funded

Data harus dihitung secara otomatis dari database.

==================================================

9. DATA PENDAFTAR

==================================================

Buat halaman:

/admin/applications

Tampilkan tabel:

- No

- Nama Lengkap

- WhatsApp

- Email

- Status Saat Ini

- Jenjang Studi

- Sekolah / Universitas

- Negara Tujuan

- Program Studi

- Rencana Intake

- Pembiayaan

- Tanggal Mengisi

- Action

Action:

- Lihat Detail

- Edit

- Hapus

==================================================

10. DETAIL PESERTA

==================================================

Ketika admin klik "Lihat Detail", tampilkan seluruh data peserta.

Kelompokkan:

DATA PESERTA

- Nama

- WhatsApp

- Email

MINAT STUDI

- Program yang diminati

- Jenjang studi

- Status pendaftar

STATUS PENDIDIKAN

- Status saat ini

- Sekolah/Universitas

- Kelas

- Semester

- Tahun lulus

- Informasi pekerjaan

DATA ORANG TUA

- Nama orang tua/wali

- WhatsApp orang tua/wali

- Pekerjaan orang tua/wali

RENCANA STUDI

- Rencana intake

- Negara tujuan

- Program studi

- Preferensi pembiayaan

INFORMASI SISTEM

- Waktu pengisian

- Waktu terakhir diperbarui

- Status persetujuan

==================================================

11. SEARCH

==================================================

Tambahkan search bar.

Admin dapat mencari berdasarkan:

- Nama

- Nomor WhatsApp

- Email

- Sekolah/Universitas

Search harus bekerja secara real-time atau dengan tombol Search.

==================================================

12. FILTER

==================================================

Tambahkan filter:

- Jenjang Studi

- Status Pendidikan

- Negara Tujuan

- Rencana Intake

- Preferensi Pembiayaan

- Tanggal Pendaftaran

Admin dapat menggabungkan beberapa filter sekaligus.

Tambahkan tombol:

"Reset Filter"

==================================================

13. SORTING

==================================================

Tambahkan sorting:

- Terbaru

- Terlama

- Nama A-Z

- Nama Z-A

==================================================

14. PAGINATION

==================================================

Gunakan pagination.

Pilihan jumlah data:

- 10

- 25

- 50

per halaman.

==================================================

15. EXPORT DATA

==================================================

Tambahkan tombol:

"Export Excel"

Admin dapat mengunduh seluruh data peserta.

Format:

- XLSX

- CSV

Export mengikuti filter yang sedang aktif jika memungkinkan.

==================================================

16. DATA REAL-TIME

==================================================

Dashboard harus menampilkan data terbaru dari database.

Ketika peserta baru mengisi form:

- Total pendaftar otomatis bertambah.

- Data baru muncul di dashboard.

- Statistik otomatis diperbarui.

Jika memungkinkan gunakan realtime subscription dari Supabase.

Tambahkan indikator:

"Pendaftar Baru"

untuk data yang baru masuk dan belum dilihat admin.

==================================================

17. EDIT DATA

==================================================

Admin dapat mengedit data peserta.

Setelah disimpan:

- Update database.

- Update timestamp updated_at.

- Dashboard otomatis diperbarui.

==================================================

18. HAPUS DATA

==================================================

Admin dapat menghapus data peserta.

Sebelum menghapus, tampilkan confirmation dialog:

"Apakah Anda yakin ingin menghapus data peserta ini?"

Tombol:

- Batal

- Hapus

Jangan menghapus tanpa konfirmasi.

==================================================

19. PENGATURAN

==================================================

Buat halaman:

/admin/settings

Berisi:

- Informasi akun admin

- Email admin

- Logout

- Pengaturan dasar aplikasi

==================================================

20. SECURITY

==================================================

Pastikan:

- Dashboard hanya dapat diakses admin.

- Peserta tidak dapat melihat data peserta lain.

- Data peserta tidak dapat diakses melalui URL publik.

- Gunakan Supabase RLS jika menggunakan Supabase.

- Authentication harus diterapkan pada semua route admin.

- Password tidak boleh disimpan plaintext.

- Jangan expose secret key di frontend.

- Gunakan environment variables untuk API keys dan credentials.

- Validasi data di frontend dan backend.

==================================================

21. RESPONSIVE

==================================================

Pastikan seluruh aplikasi responsive.

Desktop:

- Sidebar tetap terlihat.

- Dashboard menggunakan tabel.

Tablet:

- Layout menyesuaikan ukuran layar.

Mobile:

- Sidebar berubah menjadi hamburger menu.

- Tabel dapat berubah menjadi card/list.

- Form nyaman digunakan dengan satu kolom.

- Tombol mudah ditekan.

- Tidak ada horizontal overflow.

==================================================

22. USER EXPERIENCE

==================================================

Tambahkan:

- Loading state

- Empty state jika belum ada pendaftar

- Error state

- Success notification

- Confirmation dialog

- Form validation

- Disabled state pada tombol saat submit

- Toast notification setelah berhasil menyimpan/edit/delete

Gunakan bahasa Indonesia pada seluruh UI.

==================================================

23. STRUKTUR ROUTE

==================================================

Buat route:

/form

/admin/login

/admin

/admin/applications

/admin/settings

Jika root "/" dibutuhkan, arahkan ke halaman form.

==================================================

24. HASIL AKHIR

==================================================

Saya ingin aplikasi yang benar-benar berfungsi, bukan hanya desain UI.

Pastikan:

- Form dapat diisi.

- Data benar-benar tersimpan ke database.

- Admin dapat login.

- Admin dapat melihat data.

- Search berfungsi.

- Filter berfungsi.

- Sorting berfungsi.

- Pagination berfungsi.

- Detail peserta berfungsi.

- Edit berfungsi.

- Delete berfungsi.

- Export berfungsi.

- Dashboard statistik berfungsi.

- Authentication berfungsi.

- RLS/security diterapkan.

- Responsive di desktop dan mobile.

Sebelum selesai, lakukan pengecekan seluruh flow dari:

Peserta membuka form → mengisi form → submit → data masuk database → admin login → melihat data → membuka detail → filter/search → edit → export → logout.

Jangan hanya membuat mockup. Bangun seluruh fungsi frontend, backend/database, authentication, dan admin dashboard yang diperlukan agar aplikasi siap digunakan.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9047936a-5a77-4f6c-b498-6f56c9326676).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
