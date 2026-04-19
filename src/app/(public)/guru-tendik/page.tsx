import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Guru & Tenaga Kependidikan",
  description: "Daftar guru dan tenaga kependidikan sekolah.",
}

export default async function GuruTendikPage() {
  const staff = await prisma.staff.findMany({
    orderBy: { order: "asc" },
  })

  return (
    <main className="bg-white min-h-screen">

      {/* Header — konsisten */}
      <header className="bg-[#002244] relative pt-10 pb-10 md:pt-12 md:pb-12 border-b-[3px] border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-blue-300/60 text-xs font-bold tracking-widest uppercase mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span className="mx-2 opacity-40">/</span>
            <span className="text-blue-200/80">Guru &amp; Tendik</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Guru &amp; Tenaga Kependidikan
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">
            Mengenal lebih dekat tim profesional kami — {staff.length} orang
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-14 w-14 text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg font-medium">Belum ada data guru &amp; tendik</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {staff.map((person) => (
              <div key={person.id} className="group">
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 mb-2 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  {person.photoUrl ? (
                    <Image
                      src={person.photoUrl}
                      alt={person.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#002244]/10 to-[#002244]/5">
                      <span className="text-[#002244]/30 font-bold text-2xl">
                        {person.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center px-1">
                  <p className="font-semibold text-slate-800 text-sm line-clamp-2 leading-tight">
                    {person.name}
                  </p>
                  <p className="text-xs text-[#002244] font-medium mt-0.5 line-clamp-1 opacity-70">
                    {person.position}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  )
}
