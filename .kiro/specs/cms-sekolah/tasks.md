# Implementation Plan: CMS SMKN 1 Surabaya

## Overview

Implementasi CMS full-stack untuk website SMKN 1 Surabaya menggunakan Next.js 14 (App Router), Tailwind CSS + shadcn/ui, Neon PostgreSQL, Prisma ORM, Amazon S3, dan NextAuth.js v5. Tasks disusun berdasarkan dependency: fondasi proyek → database → autentikasi → RBAC → admin dashboard → modul konten → landing page → testing.

## Tasks

- [-] 1. Inisialisasi proyek dan setup fondasi
  - [-] 1.1 Scaffold proyek Next.js 14 dengan App Router, install Tailwind CSS, dan inisialisasi shadcn/ui
    - Jalankan `npx create-next-app@14` dengan TypeScript, Tailwind CSS, App Router
    - Install shadcn/ui: `npx shadcn-ui@latest init`
    - Install dependencies utama: `prisma`, `@prisma/client`, `next-auth@beta`, `@auth/prisma-adapter`, `zod`, `bcryptjs`, `@types/bcryptjs`
    - Install dependencies UI: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
    - Install dependencies S3: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
    - Install testing: `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `msw`
    - Buat file `vitest.config.ts` dengan path alias `@/` dan setup environment jsdom
    - Buat struktur direktori: `src/lib/`, `src/actions/`, `src/types/`, `src/components/public/`, `src/components/admin/`, `__tests__/unit/`, `__tests__/properties/`, `__tests__/integration/`, `__tests__/components/`
    - _Requirements: 11.8_

  - [ ] 1.2 Setup konfigurasi environment dan TypeScript types
    - Buat file `.env.example` dengan variabel: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
    - Buat file `src/types/index.ts` dengan semua TypeScript interfaces: `SessionWithRole`, `ActionResult<T>`, `MenuItemForm`, `MenuItemWithChildren`, `ArticleFilter`, `PaginatedResult<T>`, `HeroContent`, `ProfileContent`, `PrincipalContent`, `DepartmentContent`, `PresignResult`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [ ] 2. Database schema dan Prisma setup
  - [ ] 2.1 Definisikan Prisma schema lengkap dengan semua model dan relasi
    - Jalankan `npx prisma init` untuk membuat folder `prisma/`
    - Buat `prisma/schema.prisma` dengan datasource Neon PostgreSQL (connection pooling via `DATABASE_URL`, direct via `DIRECT_URL`)
    - Definisikan enum: `Role` (SUPER_ADMIN, EDITOR, CONTRIBUTOR), `ArticleStatus` (DRAFT, PUBLISHED), `MenuItemType` (INTERNAL, EXTERNAL), `ContentSection` (HERO, PROFILE, PRINCIPAL_MESSAGE, DEPARTMENT)
    - Definisikan model `User` dengan field: id, name, email (unique), password, role, isActive, relasi ke Article dan Session
    - Definisikan model `Session` dengan field: id, sessionToken (unique), userId (FK ke User), expires
    - Definisikan model `MenuItem` dengan self-relation `MenuHierarchy` untuk nested menu, field: id, label, url, type, order, parentId
    - Definisikan model `Category` dengan field: id, name, slug (unique), relasi one-to-many ke Article
    - Definisikan model `Article` dengan field: id, title, content, slug (unique), thumbnailUrl, status, authorId (FK ke User), categoryId (FK ke Category), isDeleted, publishedAt, composite index pada [status, isDeleted, publishedAt]
    - Definisikan model `GalleryImage` dengan field: id, title, description, imageUrl, order
    - Definisikan model `InstitutionalContent` dengan field: id, section (unique enum), content (Json)
    - Definisikan model `Staff` dengan field: id, name, position, photoUrl, order
    - Definisikan model `SiteSettings` dengan field: id, key (unique), value (Json)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [ ] 2.2 Buat Prisma client singleton dan jalankan migrasi awal
    - Buat file `src/lib/prisma.ts` dengan singleton pattern untuk Prisma client (hindari multiple instances di development)
    - Jalankan `npx prisma migrate dev --name init` untuk membuat migrasi awal
    - Buat seed script `prisma/seed.ts` untuk data awal: satu akun Super Admin default, kategori berita default, dan konten institusional placeholder untuk setiap section
    - Tambahkan script `prisma:seed` di `package.json`
    - _Requirements: 11.8, 12.1_

- [ ] 3. Checkpoint — Pastikan database terhubung dan migrasi berhasil
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Autentikasi dan middleware
  - [ ] 4.1 Implementasi konfigurasi NextAuth.js v5 dengan Prisma adapter
    - Buat file `src/lib/auth.ts` dengan konfigurasi NextAuth.js v5
    - Gunakan `CredentialsProvider` dengan validasi email/password via bcrypt compare
    - Konfigurasi Prisma adapter untuk session storage di Neon
    - Set session strategy ke `"database"`
    - Implementasi callback `session` untuk inject `role` dan `isActive` ke session object
    - Implementasi callback `authorized` untuk middleware check
    - Tolak login jika `isActive === false` (Requirements 12.3)
    - Buat file `src/app/api/auth/[...nextauth]/route.ts` untuk API route handler
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 4.2 Implementasi route guard middleware
    - Buat file `src/middleware.ts` dengan matcher `["/admin/:path*"]`
    - Cek session validity via NextAuth pada setiap request ke `/admin/*`
    - Redirect ke `/login` jika tidak terautentikasi
    - Cek role-based access: mapping route → permission yang dibutuhkan
    - Return 403 Forbidden page jika role tidak memiliki permission untuk route tersebut
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 4.3 Implementasi halaman login
    - Buat file `src/app/(auth)/login/page.tsx` dengan form login (email + password)
    - Gunakan shadcn/ui components: `Card`, `Input`, `Button`, `Label`
    - Tampilkan error message deskriptif tanpa mengungkapkan info sensitif
    - Redirect ke `/admin` setelah login berhasil
    - Tampilkan pesan session expired jika diarahkan dari middleware
    - _Requirements: 1.1, 1.2, 1.5_


  - [ ]* 4.4 Write property test untuk autentikasi
    - **Property 16: Password Hashing Integrity** — Untuk setiap plaintext password, stored hash TIDAK boleh sama dengan plaintext, HARUS valid bcrypt hash, dan HARUS verify correctly
    - **Validates: Requirements 12.1, 12.4**
    - **Property 17: Deactivated User Login Rejection** — Untuk setiap user dengan isActive=false, autentikasi dengan kredensial valid HARUS ditolak
    - **Validates: Requirements 12.3**

- [ ] 5. RBAC module dan permission system
  - [ ] 5.1 Implementasi RBAC permission checker
    - Buat file `src/lib/rbac.ts` dengan type definitions: `Role`, `Permission`
    - Definisikan `ROLE_PERMISSIONS` matrix sesuai design: SUPER_ADMIN (semua permission), EDITOR (content, article, gallery, staff), CONTRIBUTOR (article:create, article:edit saja)
    - Implementasi fungsi `hasPermission(role, permission)` yang return boolean
    - Implementasi fungsi `requirePermission(permission)` sebagai Server Action guard yang cek session dan throw error jika unauthorized
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7_

  - [ ]* 5.2 Write property test untuk RBAC
    - **Property 1: RBAC Permission Matrix Correctness** — Untuk setiap kombinasi role dan permission, `hasPermission` HARUS return true jika dan hanya jika permission ada di set permission role tersebut
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.7**

  - [ ] 5.3 Implementasi Zod validation schemas
    - Buat file `src/lib/validators.ts` dengan semua Zod schemas: `articleSchema`, `menuItemSchema`, `userSchema`, `staffSchema`, `galleryImageSchema`, `fileUploadSchema`
    - Setiap schema harus memiliki pesan error dalam Bahasa Indonesia
    - _Requirements: 4.6, 6.1, 7.6, 7.7, 12.1_

  - [ ]* 5.4 Write property test untuk URL validation
    - **Property 6: URL Validation** — Untuk setiap string yang bukan valid URL, validator HARUS reject. Untuk setiap valid URL, validator HARUS accept
    - **Validates: Requirements 4.6**

- [ ] 6. Checkpoint — Pastikan auth, RBAC, dan validasi berfungsi
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Admin dashboard layout dan navigasi
  - [ ] 7.1 Implementasi layout admin dengan sidebar dan header
    - Buat file `src/app/admin/layout.tsx` sebagai layout wrapper untuk semua halaman admin
    - Buat komponen `src/components/admin/sidebar.tsx` dengan navigasi: Dashboard, Menu, Konten, Berita, Galeri, Guru, Pengguna (conditional berdasarkan role)
    - Sidebar harus responsive: collapsible di mobile, fixed di desktop
    - Tampilkan info user (nama, role) di header dan tombol logout
    - Gunakan shadcn/ui components: `Sheet` (mobile sidebar), `Button`, `Avatar`, `DropdownMenu`
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ] 7.2 Implementasi halaman dashboard overview
    - Buat file `src/app/admin/page.tsx` dengan statistik ringkasan: jumlah artikel, galeri, guru, pengguna
    - Gunakan Server Component untuk fetch data langsung dari Prisma
    - Tampilkan card statistik dengan shadcn/ui `Card` component
    - _Requirements: 2.2_

- [ ] 8. Menu Builder module
  - [ ] 8.1 Implementasi Server Actions untuk menu CRUD
    - Buat file `src/actions/menu.ts` dengan fungsi: `getMenuItems()`, `saveMenuItems(items)`, `deleteMenuItem(id)`
    - `getMenuItems` harus return tree structure (parent dengan children)
    - `saveMenuItems` harus validasi hierarchy depth ≤ 2 level dan reject jika melebihi
    - `deleteMenuItem` harus cascade delete semua children (via Prisma onDelete: Cascade)
    - Wrap semua actions dengan `requirePermission("menu:manage")`
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ] 8.2 Implementasi komponen Menu Builder dengan drag-and-drop
    - Buat file `src/components/admin/menu-builder.tsx` menggunakan `@dnd-kit/core` dan `@dnd-kit/sortable`
    - Implementasi form tambah/edit item menu: label, URL, type (internal/external), parent selection
    - Drag-and-drop untuk reorder dan reparent menu items
    - Validasi URL sebelum save, tampilkan error jika invalid
    - Konfirmasi dialog saat hapus item yang memiliki children
    - Buat file `src/app/admin/menu/page.tsx` yang menggunakan komponen Menu Builder
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

  - [ ]* 8.3 Write property tests untuk Menu operations
    - **Property 3: Menu Item Round-Trip Persistence** — Untuk setiap valid menu item data, save lalu retrieve HARUS menghasilkan item dengan nilai properti identik
    - **Validates: Requirements 4.2**
    - **Property 4: Menu Hierarchy Depth Constraint** — Untuk setiap menu tree, tidak ada item dengan nesting depth > 2
    - **Validates: Requirements 4.3**
    - **Property 5: Menu Cascade Delete** — Untuk setiap menu item dengan children, delete HARUS juga menghapus semua descendants
    - **Validates: Requirements 4.5**

- [ ] 9. Manajemen konten institusional
  - [ ] 9.1 Implementasi Server Actions untuk konten institusional
    - Buat file `src/actions/content.ts` dengan fungsi: `getInstitutionalContent(section)`, `updateInstitutionalContent(section, content)`
    - Validasi content JSON sesuai schema per section (HeroContent, ProfileContent, PrincipalContent, DepartmentContent)
    - Wrap dengan `requirePermission("content:manage")`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 9.2 Implementasi halaman manajemen konten institusional
    - Buat file `src/app/admin/konten/page.tsx` dengan tab navigation untuk setiap section
    - Tab Hero Section: form untuk judul, deskripsi, gambar utama (via ImageUploader), badge label, CTA text & URL
    - Tab Profil: form dengan Tiptap editor untuk Visi, Misi, Sejarah, dan video URL
    - Tab Prakata Kepala Sekolah: form untuk teks prakata (Tiptap), nama, jabatan, foto
    - Tab Jurusan: CRUD list jurusan dengan nama, deskripsi, gambar
    - Gunakan shadcn/ui `Tabs`, `Input`, `Textarea`, `Button`
    - Tampilkan toast notification pada sukses/error save
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 9.3 Write property test untuk konten institusional
    - **Property 7: Institutional Content Round-Trip** — Untuk setiap section dan valid content JSON, save lalu retrieve HARUS menghasilkan content identik
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [ ] 10. S3 upload service dan Image Uploader
  - [ ] 10.1 Implementasi S3 client dan pre-signed URL service
    - Buat file `src/lib/s3.ts` dengan S3Client configuration
    - Implementasi `generatePresignedUrl(filename, contentType)` yang return `PresignResult` (uploadUrl, fileUrl, key)
    - Implementasi `deleteS3Object(key)` untuk hapus file dari S3
    - Buat file `src/app/api/upload/presign/route.ts` sebagai API route untuk generate pre-signed URL
    - Validasi file type dan size di API route sebelum generate URL
    - _Requirements: 8.1, 8.3, 8.4_

  - [ ] 10.2 Implementasi komponen Image Uploader
    - Buat file `src/components/admin/image-uploader.tsx` dengan props: `onUploadComplete`, `maxSizeMB`, `acceptedFormats`, `multiple`
    - Client-side validation: cek file type (JPG, PNG, WebP) dan size (≤ 5MB) sebelum upload
    - Flow: validate → request pre-signed URL → upload langsung ke S3 via PUT → return URL
    - Tampilkan progress indicator dan error messages
    - Support drag-and-drop area dan file picker
    - _Requirements: 7.6, 7.7, 8.1, 8.2, 8.4_

  - [ ]* 10.3 Write property test untuk file validation
    - **Property 14: File Type Validation** — Untuk setiap file dengan MIME type tidak di allowed set, validator HARUS reject. Untuk file dengan allowed type dan size ≤ 5MB, HARUS accept
    - **Validates: Requirements 7.6, 7.7**

- [ ] 11. Modul Berita dan Artikel
  - [ ] 11.1 Implementasi Server Actions untuk artikel CRUD
    - Buat file `src/actions/article.ts` dengan fungsi: `getArticles(params)`, `createArticle(data)`, `updateArticle(id, data)`, `publishArticle(id)`, `softDeleteArticle(id)`
    - `createArticle`: jika role Contributor, force status ke DRAFT regardless of input
    - `publishArticle`: hanya Editor/Super Admin, set status PUBLISHED dan publishedAt
    - `getArticles`: support pagination, search by title (case-insensitive), filter by category dan status, exclude soft-deleted by default
    - `softDeleteArticle`: set isDeleted=true tanpa hapus dari database
    - Auto-generate slug dari title jika tidak disediakan
    - Wrap dengan permission checks sesuai RBAC
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ] 11.2 Implementasi Tiptap rich-text editor component
    - Buat file `src/components/admin/article-editor.tsx` menggunakan `@tiptap/react` dan `@tiptap/starter-kit`
    - Toolbar: bold, italic, heading, bullet list, ordered list, image insert, link
    - Support image insertion via ImageUploader component
    - Output HTML string untuk disimpan ke database
    - _Requirements: 6.1_

  - [ ] 11.3 Implementasi halaman admin berita (list + editor)
    - Buat file `src/app/admin/berita/page.tsx` dengan tabel daftar artikel menggunakan shadcn/ui `Table` + pagination
    - Implementasi search bar dan filter dropdown (kategori, status)
    - Buat file `src/components/admin/data-table.tsx` sebagai reusable data table component
    - Buat file `src/app/admin/berita/[id]/edit/page.tsx` untuk form edit artikel dengan Tiptap editor
    - Buat halaman create artikel baru
    - Tampilkan badge status (Draft/Published) dan tombol aksi sesuai role
    - _Requirements: 6.1, 6.2, 6.5, 6.7_

  - [ ]* 11.4 Write property tests untuk artikel
    - **Property 8: Article Data Round-Trip** — Untuk setiap valid article data, create lalu retrieve HARUS menghasilkan article dengan semua field values preserved
    - **Validates: Requirements 6.1**
    - **Property 9: Article Status Enforcement by Role** — Contributor selalu menghasilkan DRAFT. Editor publish menghasilkan PUBLISHED dengan publishedAt non-null
    - **Validates: Requirements 6.3, 6.4**
    - **Property 10: Article Search Filter Correctness** — Semua artikel yang dikembalikan search HARUS mengandung query string di title. Filter category dan status HARUS tepat
    - **Validates: Requirements 6.5**
    - **Property 11: Soft-Delete Exclusion** — Artikel soft-deleted TIDAK boleh muncul di listing/search normal
    - **Validates: Requirements 6.6**
    - **Property 12: Published Articles Ordering** — Artikel published HARUS terurut descending berdasarkan publishedAt
    - **Validates: Requirements 6.8**

- [ ] 12. Checkpoint — Pastikan semua modul admin berfungsi
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Modul Galeri Foto
  - [ ] 13.1 Implementasi Server Actions untuk galeri
    - Buat file `src/actions/gallery.ts` dengan fungsi: `getGalleryImages()`, `addGalleryImages(images)`, `reorderGalleryImages(orderedIds)`, `deleteGalleryImage(id)`
    - `addGalleryImages`: support batch insert multiple images
    - `reorderGalleryImages`: terima array of IDs dalam urutan baru, update field `order` sesuai index
    - `deleteGalleryImage`: hapus metadata dari DB dan file dari S3 via `deleteS3Object`
    - Wrap dengan `requirePermission("gallery:manage")`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 13.2 Implementasi halaman admin galeri
    - Buat file `src/app/admin/galeri/page.tsx` dengan grid view foto
    - Multiple upload via ImageUploader component (multiple=true)
    - Drag-and-drop reorder menggunakan @dnd-kit
    - Form edit metadata (judul, deskripsi) per foto
    - Konfirmasi dialog sebelum hapus
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7_

  - [ ]* 13.3 Write property tests untuk galeri
    - **Property 13: Gallery Image Reorder Round-Trip** — Untuk setiap permutasi gallery image IDs, reorder lalu retrieve HARUS return dalam urutan yang ditentukan
    - **Validates: Requirements 7.3**

- [ ] 14. Manajemen Data Guru dan Staf
  - [ ] 14.1 Implementasi Server Actions untuk data guru
    - Buat file `src/actions/staff.ts` dengan fungsi: `getStaffList()`, `createStaff(data)`, `updateStaff(id, data)`, `deleteStaff(id)`
    - `deleteStaff`: hapus data dari DB dan foto dari S3
    - Wrap dengan `requirePermission("staff:manage")`
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 14.2 Implementasi halaman admin guru
    - Buat file `src/app/admin/guru/page.tsx` dengan tabel data guru
    - Form tambah/edit: nama, jabatan, foto (via ImageUploader), urutan tampil
    - Drag-and-drop reorder untuk urutan tampil
    - Konfirmasi dialog sebelum hapus
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 14.3 Write property test untuk data guru
    - **Property 15: Staff Data Round-Trip** — Untuk setiap valid staff data, create lalu retrieve HARUS menghasilkan record dengan semua field values preserved
    - **Validates: Requirements 10.1**

- [ ] 15. Manajemen Akun Staf (User Management)
  - [ ] 15.1 Implementasi Server Actions untuk manajemen user
    - Buat file `src/actions/user.ts` dengan fungsi: `getUsers()`, `createUser(data)`, `deactivateUser(id)`, `resetPassword(id)`
    - `createUser`: hash password dengan bcrypt, simpan dengan role yang ditentukan
    - `deactivateUser`: set isActive=false
    - `resetPassword`: generate password baru, hash, dan simpan
    - Cek: tidak boleh deactivate/delete Super Admin terakhir
    - Wrap dengan `requirePermission("user:manage")`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 3.5, 3.6_

  - [ ] 15.2 Implementasi halaman admin pengguna
    - Buat file `src/app/admin/pengguna/page.tsx` dengan tabel daftar pengguna
    - Tampilkan: nama, email, role, status (aktif/nonaktif)
    - Form tambah user baru: nama, email, password, role selection
    - Tombol aksi: deactivate, reset password
    - Konfirmasi dialog untuk aksi destructive
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 16. Checkpoint — Pastikan semua modul admin dan CRUD berfungsi
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Landing page components (matching index4.html)
  - [ ] 17.1 Implementasi layout publik dan Navbar
    - Buat file `src/app/(public)/layout.tsx` sebagai layout wrapper dengan Navbar dan Footer
    - Buat file `src/components/public/navbar.tsx`: sticky header, logo SMKN 1 Surabaya (kuning-navy), menu navigasi dinamis dari database (via `getMenuItems`), mobile hamburger toggle
    - Gunakan Server Component untuk fetch menu items
    - Responsive: desktop horizontal nav, mobile collapsible menu
    - _Requirements: 9.1, 4.4_

  - [ ] 17.2 Implementasi Hero Section
    - Buat file `src/components/public/hero-section.tsx` dengan background navy (#002244)
    - Fetch data dari InstitutionalContent section HERO + berita terbaru
    - Layout: teks hero (judul, deskripsi, tombol CTA) di kiri, gambar utama di kanan
    - Badge label (e.g., "Prestasi Siswa"), dot indicators
    - Responsive: stack vertical di mobile
    - Gunakan Next.js `Image` component untuk optimasi gambar
    - _Requirements: 9.2, 8.2, 8.5_

  - [ ] 17.3 Implementasi section Profil dan Berita Terbaru
    - Buat file `src/components/public/profile-news-section.tsx`
    - Layout 2 kolom: profil + video (7/12) di kiri, berita terbaru (5/12) di kanan
    - Kiri: judul "Profil SMK Negeri 1 Surabaya", video embed dengan play button overlay, deskripsi profil
    - Kanan: judul "Berita Terbaru" dengan tombol "Lebih Banyak", daftar 3 berita terbaru dengan thumbnail
    - Fetch data dari InstitutionalContent PROFILE dan Article (published, ordered by publishedAt desc)
    - _Requirements: 9.3, 6.8_

  - [ ] 17.4 Implementasi section Prakata Kepala Sekolah
    - Buat file `src/components/public/principal-section.tsx`
    - Pattern background: radial-gradient dots pada #004d80
    - Layout: teks prakata italic (8/12) di kiri, foto kepala sekolah (4/12) di kanan
    - Foto dengan border kuning dan efek grayscale
    - Nama dan jabatan di bawah teks prakata
    - Fetch data dari InstitutionalContent PRINCIPAL_MESSAGE
    - _Requirements: 9.4_

  - [ ] 17.5 Implementasi section Galeri Sekolah
    - Buat file `src/components/public/gallery-section.tsx`
    - Grid responsif: 2 kolom (mobile), 3 kolom (tablet), 4 kolom (desktop)
    - Hover zoom effect pada gambar (scale 1.05)
    - Header dengan judul (border-left biru) dan link "Lihat Semua"
    - Gunakan Next.js `Image` component dengan lazy loading
    - Fetch data dari GalleryImage ordered by `order`
    - _Requirements: 9.5, 7.5, 8.2, 8.5_

  - [ ] 17.6 Implementasi Staff Slider (Guru & Tenaga Kependidikan)
    - Buat file `src/components/public/staff-slider.tsx` menggunakan Embla Carousel (shadcn/ui Carousel)
    - Responsive slides: 2 (mobile), 3 (tablet), 4 (desktop)
    - Autoplay dengan pagination dots
    - Card: foto circular grayscale, nama bold, jabatan biru
    - Fetch data dari Staff ordered by `order`
    - _Requirements: 9.6, 10.4_

  - [ ] 17.7 Implementasi Footer
    - Buat file `src/components/public/footer.tsx` dengan background navy dan border-top kuning
    - 4 kolom grid: identitas sekolah + ikon sosmed, tautan cepat, informasi, kontak
    - Logo SMKN 1 Surabaya, deskripsi singkat
    - Ikon sosial media: Facebook, Instagram, YouTube
    - Copyright bar di bawah
    - _Requirements: 9.7_

  - [ ] 17.8 Implementasi halaman utama Landing Page (SSR)
    - Buat file `src/app/(public)/page.tsx` sebagai Server Component
    - Compose semua section components: HeroSection, ProfileNewsSection, PrincipalSection, GallerySection, StaffSlider
    - Fetch semua data di server level untuk SSR
    - Implementasi metadata untuk SEO (title, description, Open Graph)
    - _Requirements: 9.8, 9.9_

  - [ ] 17.9 Implementasi halaman detail berita dan daftar berita
    - Buat file `src/app/(public)/berita/page.tsx` untuk daftar semua berita published dengan pagination
    - Buat file `src/app/(public)/berita/[slug]/page.tsx` untuk detail artikel
    - Render rich-text content dari Tiptap HTML
    - Tampilkan metadata: author, tanggal publikasi, kategori
    - Gunakan Next.js `Image` untuk thumbnail
    - _Requirements: 6.8, 9.8_

- [ ] 18. Property test untuk Route Guard
  - [ ]* 18.1 Write property test untuk Route Guard
    - **Property 2: Route Guard Access Control** — Untuk setiap admin route path dan session state, middleware HARUS redirect ke /login jika unauthenticated, return 403 jika role tidak punya permission, atau allow access jika role punya permission
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [ ] 19. Integration dan final wiring
  - [ ] 19.1 Wire menu builder ke landing page navbar
    - Pastikan perubahan menu di admin langsung terrefleksi di navbar landing page
    - Gunakan `revalidatePath` di Server Actions menu untuk invalidate cache
    - Test: save menu → refresh landing page → navbar updated
    - _Requirements: 4.4_

  - [ ] 19.2 Wire semua konten admin ke landing page
    - Pastikan update konten institusional (hero, profil, prakata, jurusan) terrefleksi di landing page
    - Pastikan artikel published muncul di section berita landing page
    - Pastikan galeri dan data guru terrefleksi di landing page
    - Gunakan `revalidatePath("/")` di semua Server Actions yang mempengaruhi landing page
    - _Requirements: 4.4, 5.2, 5.3, 5.4, 5.5, 6.8, 7.5, 10.4_

  - [ ]* 19.3 Write integration tests
    - Test auth flow: login → session → access admin → logout
    - Test menu flow: create menu → save → verify di landing page navbar
    - Test article flow: create draft → publish → verify di landing page
    - Test S3 upload flow: request pre-signed URL → mock upload → verify URL saved
    - _Requirements: 1.1, 1.3, 4.4, 6.4, 8.1_

- [ ] 20. Final checkpoint — Pastikan semua tests pass dan fitur terintegrasi
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (17 properties total)
- Unit tests validate specific examples and edge cases
- Landing page components harus match layout dan styling dari referensi `index4.html`
- Semua Server Actions menggunakan pattern `ActionResult<T>` untuk consistent error handling
- Embla Carousel (shadcn/ui) digunakan sebagai pengganti Swiper.js dari referensi HTML
