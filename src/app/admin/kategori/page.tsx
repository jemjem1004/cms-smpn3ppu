import { redirect } from "next/navigation"

// Kategori dikelola di dalam halaman Berita (tab Kategori)
export default function KategoriPage() {
  redirect("/admin/berita")
}
