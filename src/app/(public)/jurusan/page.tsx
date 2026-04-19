import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getPublicDepartments } from "@/actions/department"
import { BookOpen, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Jurusan",
  description: "Program keahlian dan jurusan yang tersedia.",
}

export default async function JurusanPage() {
  const departments = await getPublicDepartments()

  return (
    <main className="bg-white min-h-screen">

      {/* Header — konsisten */}
      <header className="bg-[#002244] relative pt-10 pb-10 md:pt-12 md:pb-12 border-b-[3px] border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-blue-300/60 text-xs font-bold tracking-widest uppercase mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span className="mx-2 opacity-40">/</span>
            <span className="text-blue-200/80">Jurusan</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Program Keahlian
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">
            Pilihan jurusan dan program keahlian yang tersedia
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-14 w-14 text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg font-medium">Belum ada data jurusan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Link
                key={dept.id}
                href={`/jurusan/${dept.slug}`}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative aspect-[16/9] bg-gray-100">
                  {dept.imageUrl ? (
                    <Image
                      src={dept.imageUrl}
                      alt={dept.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#002244]/10 to-[#002244]/5">
                      <BookOpen className="h-10 w-10 text-[#002244]/20" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-[#002244] text-base leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                    {dept.name}
                  </h2>
                  {dept.description && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{dept.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#002244] group-hover:text-blue-600 transition-colors">
                    Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
