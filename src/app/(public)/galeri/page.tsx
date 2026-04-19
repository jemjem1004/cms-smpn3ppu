import type { Metadata } from "next"
import Image from "next/image"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Galeri — SMKN 1 Surabaya",
  description: "Galeri foto kegiatan dan fasilitas SMKN 1 Surabaya.",
}

export default async function GaleriPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { order: "asc" },
  })

  return (
    <section className="bg-gray-50 min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#002244]">Galeri Sekolah</h1>
          <p className="mt-2 text-gray-500">Dokumentasi kegiatan dan fasilitas SMKN 1 Surabaya</p>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden group">
                <Image
                  src={image.imageUrl}
                  alt={image.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-400 text-lg">Belum ada foto di galeri</p>
          </div>
        )}
      </div>
    </section>
  )
}
