import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { HeroContent } from "@/types"

const DEFAULT_HERO: HeroContent = {
  title: "Selamat Datang di SMKN 1 Surabaya",
  description:
    "Sekolah Menengah Kejuruan Negeri 1 Surabaya — mencetak generasi unggul, kompeten, dan siap bersaing di era global.",
  imageUrl: "",
  badgeLabel: "Prestasi Siswa",
  ctaText: "Baca Lebih Lanjut",
  ctaUrl: "/berita",
}

export async function HeroSection() {
  const [heroRecord, latestArticle] = await Promise.all([
    prisma.institutionalContent.findUnique({ where: { section: "HERO" } }),
    prisma.article.findFirst({
      where: { status: "PUBLISHED", isDeleted: false },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        publishedAt: true,
        category: { select: { name: true } },
      },
    }),
  ])

  const hero: HeroContent = heroRecord
    ? (heroRecord.content as unknown as HeroContent)
    : DEFAULT_HERO

  const badgeLabel =
    latestArticle?.category?.name ?? hero.badgeLabel ?? "Berita Terbaru"

  const displayImage = hero.imageUrl || latestArticle?.thumbnailUrl || ""

  return (
    <section className="relative bg-gradient-to-br from-[#0f172a] via-[#002244] to-[#01142A] overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">
          {/* Left — text content */}
          <div className="flex-1 text-center md:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold rounded-full bg-yellow-400/10 text-yellow-500 border border-yellow-500/20 backdrop-blur-sm shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
              {badgeLabel}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300 leading-[1.15] mb-6 drop-shadow-sm">
              {hero.title}
            </h1>

            <p className="text-slate-300 font-light text-base sm:text-lg mb-10 max-w-xl mx-auto md:mx-0 leading-relaxed">
              {hero.description}
            </p>

            <Link
              href={hero.ctaUrl || "/berita"}
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-[#FFC107] text-[#0f172a] tracking-wide font-bold hover:bg-[#FFD54F] transition-all duration-300 shadow-[0_4px_14px_0_rgba(255,193,7,0.2)] hover:shadow-[0_6px_20px_rgba(255,193,7,0.4)] hover:-translate-y-0.5"
            >
              {hero.ctaText || "Baca Lebih Lanjut"}
            </Link>

            {/* Dot indicators */}
            <div className="flex items-center gap-3 mt-12 justify-center md:justify-start" aria-hidden="true">
              <span className="h-2 w-8 rounded-full bg-[#FFC107] transition-all duration-300 shadow-sm" />
              <span className="h-2 w-2 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors" />
              <span className="h-2 w-2 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors" />
              <span className="h-2 w-2 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Right — hero image */}
          <div className="flex-1 w-full max-w-xl md:max-w-none relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-[#FFC107] rounded-2xl blur opacity-20 animate-pulse" />
            {displayImage ? (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5 group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent z-10 pointer-events-none" />
                <Image
                  src={displayImage}
                  alt={hero.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            ) : (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white/40 text-sm font-medium">Gambar belum tersedia</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
