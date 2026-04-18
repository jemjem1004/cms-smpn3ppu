# Requirements Document: CMS SMKN 1 Surabaya

## Introduction

Sistem Content Management System (CMS) untuk website SMKN 1 Surabaya yang memungkinkan pengelolaan konten sekolah secara dinamis melalui admin dashboard. Sistem ini mencakup halaman publik (landing page) dengan desain modern premium dan panel administrasi dengan Role-Based Access Control (RBAC). Dibangun menggunakan Next.js (App Router), Tailwind CSS, shadcn/ui, Neon PostgreSQL, Prisma ORM, Amazon S3, dan NextAuth.js.

## Glossary

- **CMS**: Content Management System — sistem untuk membuat, mengelola, dan mempublikasikan konten digital
- **Landing_Page**: Halaman publik utama website sekolah yang dapat diakses tanpa autentikasi
- **Admin_Dashboard**: Panel administrasi yang dilindungi autentikasi untuk mengelola konten website
- **Auth_System**: Modul autentikasi berbasis NextAuth.js dengan Prisma adapter dan session storage di Neon
- **RBAC_Module**: Modul Role-Based Access Control yang mengatur hak akses berdasarkan peran pengguna
- **Super_Admin**: Peran dengan kontrol penuh atas sistem, menu, dan akun staf
- **Editor**: Peran yang dapat memvalidasi dan mempublikasikan konten secara langsung
- **Contributor**: Peran yang hanya dapat menulis draft berita yang memerlukan persetujuan
- **Menu_Builder**: Komponen untuk membangun navigasi header secara dinamis dengan dukungan nested menu
- **Content_Manager**: Modul pengelolaan konten institusional (hero section, profil, jurusan)
- **News_Module**: Modul CRUD artikel berita dengan kategori dan status publikasi
- **Gallery_Module**: Modul pengelolaan galeri foto sekolah
- **Media_Storage**: Layanan penyimpanan aset media menggunakan Amazon S3 dengan pre-signed URLs
- **Route_Guard**: Middleware Next.js untuk melindungi route /admin dari akses tidak terautentikasi
- **Image_Optimizer**: Komponen Next.js Image untuk kompresi otomatis gambar dari S3
- **Prisma_Schema**: Definisi skema database menggunakan Prisma ORM untuk relasi tabel di Neon PostgreSQL
- **Staff_Slider**: Komponen slider guru dan tenaga kependidikan menggunakan carousel

## Requirements

### Requirement 1: Autentikasi dan Manajemen Sesi

**User Story:** Sebagai administrator sekolah, saya ingin login ke dashboard admin dengan aman, sehingga hanya pengguna terotorisasi yang dapat mengelola konten website.

#### Acceptance Criteria

1. WHEN seorang pengguna mengakses halaman login dan memasukkan kredensial yang valid, THE Auth_System SHALL mengautentikasi pengguna dan membuat sesi yang tersimpan di Neon PostgreSQL melalui Prisma adapter
2. WHEN seorang pengguna mengakses halaman login dan memasukkan kredensial yang tidak valid, THE Auth_System SHALL menampilkan pesan error yang deskriptif tanpa mengungkapkan informasi sensitif
3. WHEN seorang pengguna yang sudah login mengklik tombol logout, THE Auth_System SHALL menghapus sesi pengguna dan mengarahkan ke halaman login
4. WHILE seorang pengguna memiliki sesi aktif, THE Auth_System SHALL mempertahankan status autentikasi di seluruh halaman admin
5. IF sesi pengguna telah kedaluwarsa, THEN THE Auth_System SHALL mengarahkan pengguna ke halaman login dengan pesan yang menjelaskan bahwa sesi telah berakhir

### Requirement 2: Proteksi Route Admin

**User Story:** Sebagai pemilik sistem, saya ingin semua route admin dilindungi dari akses tidak sah, sehingga konten website tetap aman.

#### Acceptance Criteria

1. WHEN pengguna yang tidak terautentikasi mengakses route yang diawali /admin, THE Route_Guard SHALL mengarahkan pengguna ke halaman login
2. WHILE pengguna terautentikasi mengakses route /admin, THE Route_Guard SHALL mengizinkan akses dan memuat halaman yang diminta
3. WHEN pengguna terautentikasi mengakses route admin yang tidak sesuai dengan perannya, THE Route_Guard SHALL menampilkan halaman 403 Forbidden
4. THE Route_Guard SHALL memeriksa validitas sesi pada setiap request ke route /admin

### Requirement 3: Role-Based Access Control (RBAC)

**User Story:** Sebagai Super Admin, saya ingin mengatur hak akses berdasarkan peran pengguna, sehingga setiap staf hanya dapat mengakses fitur sesuai tanggung jawabnya.

#### Acceptance Criteria

1. THE RBAC_Module SHALL mendukung tiga peran: Super_Admin, Editor, dan Contributor
2. WHILE pengguna memiliki peran Super_Admin, THE RBAC_Module SHALL memberikan akses penuh ke seluruh fitur sistem termasuk manajemen menu, manajemen akun staf, dan seluruh modul konten
3. WHILE pengguna memiliki peran Editor, THE RBAC_Module SHALL memberikan akses untuk membuat, mengedit, memvalidasi, dan mempublikasikan konten secara langsung
4. WHILE pengguna memiliki peran Contributor, THE RBAC_Module SHALL membatasi akses hanya untuk membuat dan mengedit draft berita milik sendiri
5. WHEN seorang Super_Admin membuat akun staf baru, THE RBAC_Module SHALL menyimpan akun dengan peran yang ditentukan ke database
6. WHEN seorang Super_Admin mengubah peran pengguna, THE RBAC_Module SHALL memperbarui hak akses pengguna pada sesi berikutnya
7. IF seorang Contributor mencoba mempublikasikan artikel secara langsung, THEN THE RBAC_Module SHALL menolak aksi tersebut dan menampilkan pesan bahwa artikel memerlukan persetujuan Editor

### Requirement 4: Dynamic Menu Builder

**User Story:** Sebagai Super Admin, saya ingin membangun dan mengatur menu navigasi website secara dinamis, sehingga struktur navigasi dapat disesuaikan tanpa mengubah kode.

#### Acceptance Criteria

1. THE Menu_Builder SHALL menampilkan antarmuka drag-and-drop untuk mengatur urutan dan hierarki item menu
2. WHEN seorang Super_Admin menambahkan item menu baru, THE Menu_Builder SHALL menyimpan item dengan properti: label, URL tujuan (internal atau eksternal), parent menu (untuk nested), dan urutan tampil
3. THE Menu_Builder SHALL mendukung nested menu hingga dua level kedalaman
4. WHEN seorang Super_Admin menyimpan perubahan menu, THE Menu_Builder SHALL memperbarui navigasi header pada Landing_Page secara real-time
5. WHEN seorang Super_Admin menghapus item menu yang memiliki sub-menu, THE Menu_Builder SHALL menampilkan konfirmasi dan menghapus seluruh sub-menu terkait
6. IF URL tujuan yang dimasukkan tidak valid, THEN THE Menu_Builder SHALL menampilkan pesan validasi error

### Requirement 5: Manajemen Konten Institusional

**User Story:** Sebagai Editor, saya ingin mengelola konten profil sekolah dan informasi institusional, sehingga informasi sekolah selalu akurat dan terkini.

#### Acceptance Criteria

1. WHEN seorang Editor mengakses halaman manajemen konten, THE Content_Manager SHALL menampilkan form pengelolaan untuk: Hero Section, Profil Sekolah (Visi, Misi, Sejarah), Prakata Kepala Sekolah, dan detail Jurusan/Program Keahlian
2. WHEN seorang Editor memperbarui konten Hero Section, THE Content_Manager SHALL menyimpan judul, deskripsi, gambar utama, dan label badge ke database
3. WHEN seorang Editor memperbarui halaman profil sekolah, THE Content_Manager SHALL menyimpan konten rich-text untuk Visi, Misi, dan Sejarah sekolah
4. WHEN seorang Editor memperbarui Prakata Kepala Sekolah, THE Content_Manager SHALL menyimpan teks prakata, nama, jabatan, dan foto Kepala Sekolah
5. WHEN seorang Editor menambahkan atau mengedit detail jurusan, THE Content_Manager SHALL menyimpan nama jurusan, deskripsi, dan gambar representatif
6. IF penyimpanan konten gagal karena error database, THEN THE Content_Manager SHALL menampilkan pesan error dan mempertahankan data yang sudah diisi pada form

### Requirement 6: Modul Berita dan Artikel

**User Story:** Sebagai pengelola konten, saya ingin membuat, mengedit, dan mempublikasikan artikel berita sekolah, sehingga informasi terbaru dapat disampaikan kepada publik.

#### Acceptance Criteria

1. WHEN seorang pengguna dengan peran Editor atau Contributor membuat artikel baru, THE News_Module SHALL menyimpan artikel dengan field: judul, konten (rich-text), kategori, gambar thumbnail, dan status publikasi
2. THE News_Module SHALL mendukung dua status publikasi: Draft dan Published
3. WHEN seorang Contributor menyimpan artikel, THE News_Module SHALL menyimpan artikel dengan status Draft
4. WHEN seorang Editor mempublikasikan artikel, THE News_Module SHALL mengubah status artikel menjadi Published dan mencatat tanggal publikasi
5. WHEN seorang pengguna admin mencari artikel, THE News_Module SHALL mendukung pencarian berdasarkan judul dan filter berdasarkan kategori serta status publikasi
6. WHEN seorang Editor menghapus artikel, THE News_Module SHALL melakukan soft-delete dengan menandai artikel sebagai dihapus tanpa menghapus data dari database
7. THE News_Module SHALL menampilkan daftar artikel dengan pagination di halaman admin
8. WHEN artikel berstatus Published ditampilkan di Landing_Page, THE News_Module SHALL mengurutkan artikel berdasarkan tanggal publikasi terbaru

### Requirement 7: Manajemen Galeri Foto

**User Story:** Sebagai Editor, saya ingin mengelola galeri foto sekolah, sehingga dokumentasi kegiatan dan fasilitas sekolah dapat ditampilkan di website.

#### Acceptance Criteria

1. WHEN seorang Editor mengunggah foto ke galeri, THE Gallery_Module SHALL menyimpan file gambar ke Media_Storage dan metadata (judul, deskripsi, urutan tampil) ke database
2. THE Gallery_Module SHALL mendukung unggah multiple foto dalam satu operasi
3. WHEN seorang Editor mengatur ulang urutan foto, THE Gallery_Module SHALL memperbarui urutan tampil di database
4. WHEN seorang Editor menghapus foto dari galeri, THE Gallery_Module SHALL menghapus file dari Media_Storage dan metadata dari database
5. THE Gallery_Module SHALL menampilkan foto dalam format grid responsif pada Landing_Page dengan efek hover zoom
6. IF file yang diunggah bukan format gambar yang didukung (JPG, PNG, WebP), THEN THE Gallery_Module SHALL menolak unggahan dan menampilkan pesan format yang didukung
7. IF ukuran file melebihi batas maksimum 5MB, THEN THE Gallery_Module SHALL menolak unggahan dan menampilkan pesan batas ukuran

### Requirement 8: Penyimpanan dan Optimasi Media

**User Story:** Sebagai pengelola sistem, saya ingin aset media disimpan secara efisien dan dioptimasi untuk performa website, sehingga halaman publik memuat dengan cepat.

#### Acceptance Criteria

1. WHEN seorang pengguna admin mengunggah gambar, THE Media_Storage SHALL menghasilkan pre-signed URL untuk upload langsung ke Amazon S3
2. WHEN gambar ditampilkan di Landing_Page, THE Image_Optimizer SHALL menggunakan komponen Next.js Image untuk kompresi otomatis dan lazy loading
3. THE Media_Storage SHALL menyimpan URL referensi gambar di database setelah upload berhasil
4. IF upload ke S3 gagal, THEN THE Media_Storage SHALL menampilkan pesan error dan memungkinkan pengguna mencoba kembali
5. THE Image_Optimizer SHALL menyajikan gambar dalam format WebP ketika browser mendukung format tersebut

### Requirement 9: Landing Page Publik

**User Story:** Sebagai pengunjung website, saya ingin melihat informasi sekolah yang lengkap dan menarik, sehingga saya mendapatkan gambaran komprehensif tentang SMKN 1 Surabaya.

#### Acceptance Criteria

1. THE Landing_Page SHALL menampilkan sticky navbar dengan logo sekolah, menu navigasi dinamis dari Menu_Builder, dan tombol menu mobile responsif
2. THE Landing_Page SHALL menampilkan Hero Section dengan background navy yang berisi highlight berita terbaru, deskripsi, tombol "Baca Lebih Lanjut", dan gambar utama
3. THE Landing_Page SHALL menampilkan section profil sekolah dalam layout dua kolom: profil dengan video di sisi kiri dan daftar berita terbaru di sisi kanan
4. THE Landing_Page SHALL menampilkan section Prakata Kepala Sekolah dengan pattern background, teks prakata, dan foto Kepala Sekolah
5. THE Landing_Page SHALL menampilkan galeri foto sekolah dalam format grid responsif (2 kolom mobile, 3 kolom tablet, 4 kolom desktop)
6. THE Landing_Page SHALL menampilkan slider Guru dan Tenaga Kependidikan menggunakan carousel dengan autoplay dan pagination
7. THE Landing_Page SHALL menampilkan footer dengan informasi kontak, tautan cepat, tautan informasi, dan ikon media sosial
8. THE Landing_Page SHALL dirender menggunakan Server-Side Rendering (SSR) untuk optimasi SEO
9. THE Landing_Page SHALL responsif dan menampilkan layout yang sesuai pada perangkat mobile, tablet, dan desktop

### Requirement 10: Manajemen Data Guru dan Tenaga Kependidikan

**User Story:** Sebagai Editor, saya ingin mengelola data guru dan tenaga kependidikan, sehingga informasi staf sekolah yang ditampilkan di website selalu terkini.

#### Acceptance Criteria

1. WHEN seorang Editor menambahkan data guru baru, THE Content_Manager SHALL menyimpan nama, jabatan, foto, dan urutan tampil ke database
2. WHEN seorang Editor mengedit data guru, THE Content_Manager SHALL memperbarui informasi yang diubah di database
3. WHEN seorang Editor menghapus data guru, THE Content_Manager SHALL menghapus data dari database dan foto terkait dari Media_Storage
4. THE Staff_Slider SHALL menampilkan data guru dalam format carousel responsif (2 slide mobile, 3 slide tablet, 4 slide desktop) dengan autoplay pada Landing_Page

### Requirement 11: Skema Database dan Relasi

**User Story:** Sebagai developer, saya ingin skema database terdefinisi dengan jelas menggunakan Prisma ORM, sehingga relasi antar tabel konsisten dan migrasi database terkelola dengan baik.

#### Acceptance Criteria

1. THE Prisma_Schema SHALL mendefinisikan model User dengan field: id, name, email, password (hashed), role (enum: SUPER_ADMIN, EDITOR, CONTRIBUTOR), dan timestamp
2. THE Prisma_Schema SHALL mendefinisikan model MenuItem dengan field: id, label, url, type (internal/external), parentId (self-relation untuk nested menu), order, dan timestamp
3. THE Prisma_Schema SHALL mendefinisikan model Article dengan field: id, title, content, slug (unique), categoryId, thumbnailUrl, status (enum: DRAFT, PUBLISHED), authorId (relasi ke User), publishedAt, dan timestamp
4. THE Prisma_Schema SHALL mendefinisikan model Category dengan field: id, name, slug (unique), dan relasi one-to-many ke Article
5. THE Prisma_Schema SHALL mendefinisikan model GalleryImage dengan field: id, title, description, imageUrl, order, dan timestamp
6. THE Prisma_Schema SHALL mendefinisikan model InstitutionalContent dengan field: id, section (enum: HERO, PROFILE, PRINCIPAL_MESSAGE, DEPARTMENT), content (JSON), dan timestamp
7. THE Prisma_Schema SHALL mendefinisikan model Staff dengan field: id, name, position, photoUrl, order, dan timestamp
8. THE Prisma_Schema SHALL menggunakan koneksi ke Neon PostgreSQL dengan konfigurasi connection pooling

### Requirement 12: Manajemen Akun Staf oleh Super Admin

**User Story:** Sebagai Super Admin, saya ingin mengelola akun staf yang memiliki akses ke dashboard admin, sehingga kontrol akses tetap terjaga.

#### Acceptance Criteria

1. WHEN seorang Super_Admin membuat akun staf baru, THE Admin_Dashboard SHALL menyimpan data pengguna dengan password yang di-hash dan peran yang ditentukan
2. WHEN seorang Super_Admin melihat daftar akun staf, THE Admin_Dashboard SHALL menampilkan daftar pengguna dengan nama, email, peran, dan status akun
3. WHEN seorang Super_Admin menonaktifkan akun staf, THE Admin_Dashboard SHALL menandai akun sebagai nonaktif dan mencegah login pada sesi berikutnya
4. WHEN seorang Super_Admin mereset password akun staf, THE Admin_Dashboard SHALL menghasilkan password baru yang di-hash dan menyimpannya ke database
5. IF seorang Super_Admin mencoba menghapus akun Super_Admin terakhir, THEN THE Admin_Dashboard SHALL menolak aksi tersebut dan menampilkan pesan bahwa minimal satu Super_Admin harus ada dalam sistem
