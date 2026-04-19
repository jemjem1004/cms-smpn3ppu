import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export async function GallerySection() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { order: "asc" },
    take: 8,
  })

  if (images.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#002244] border-l-4 border-[#0066CC] pl-4">
            Galeri Sekolah
          </h2>
          <Link
            href="/galeri"
            className="text-sm font-semibold text-[#0066CC] hover:text-[#004d99] transition-colors"
          >
            Lihat Semua →
          </Link>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <Image
                src={image.imageUrl}
                alt={image.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <p className="text-white text-sm font-medium p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate w-full">
                  {image.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
