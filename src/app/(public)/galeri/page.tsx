import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ImageIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Galeri",
  description: "Galeri foto kegiatan dan fasilitas sekolah.",
}

export default async function GaleriPage() {
  const images = await prisma.galleryImage.findMany({
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
            <span className="text-blue-200/80">Galeri</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Galeri Sekolah
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">
            Dokumentasi kegiatan dan fasilitas sekolah
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100">
                <Image
                  src={image.imageUrl}
                  alt={image.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex flex-col items-start justify-end p-4">
                  <p className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.title}
                  </p>
                  {image.description && (
                    <p className="text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
                      {image.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ImageIcon className="h-14 w-14 text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg font-medium">Belum ada foto di galeri</p>
          </div>
        )}
      </section>
    </main>
  )
}
