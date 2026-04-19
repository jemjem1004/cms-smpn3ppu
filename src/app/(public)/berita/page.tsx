import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Calendar, User, Newspaper, ChevronRight, ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Berita & Artikel",
  description: "Kumpulan berita dan artikel terbaru dari sekolah.",
}

const ARTICLES_PER_PAGE = 12

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

function formatDate(date: Date | null): string {
  if (!date) return ""
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1)

  const where = { status: "PUBLISHED" as const, isDeleted: false }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (currentPage - 1) * ARTICLES_PER_PAGE,
      take: ARTICLES_PER_PAGE,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.article.count({ where }),
  ])

  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE)

  return (
    <main className="bg-white min-h-screen">
      
      {/* Premium Hero Header */}
      <section className="relative bg-[#001833] pt-20 pb-24 overflow-hidden border-b-2 border-[#FFC107]/20">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFC107]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
              <span className="h-[1px] w-8 bg-[#FFC107]" />
              <span className="text-[#FFC107] text-xs font-bold uppercase tracking-widest">Informasi Terkini</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Berita & <span className="text-[#FFC107]">Artikel</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto md:mx-0 leading-relaxed">
              Jelajahi kumpulan berita terbaru, pengumuman, dan artikel inspiratif seputar kegiatan sekolah kami.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {articles.length > 0 ? (
          <>
            {/* Article Grid - Clean & Modern Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => {
                const excerpt = stripHtml(article.content).slice(0, 120)
                return (
                  <Link
                    key={article.id}
                    href={`/berita/${article.slug}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-[#FFC107]/30 hover:shadow-2xl hover:shadow-[#002244]/5 transition-all duration-500"
                  >
                    {/* Thumbnail with Overlay */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      {article.thumbnailUrl ? (
                        <Image
                          src={article.thumbnailUrl}
                          alt={article.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-200">
                          <Newspaper className="h-12 w-12" />
                        </div>
                      )}
                      
                      {/* Category Badge Floating */}
                      {article.category && (
                        <div className="absolute top-4 left-4 z-20">
                          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#002244] rounded-lg shadow-sm border border-white/50">
                            {article.category.name}
                          </span>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#002244]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Content Area - More compact */}
                    <div className="p-4 flex flex-col flex-1">
                      {/* Meta Info - Tighter */}
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5 text-[#FFC107]" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>

                      <h2 className="text-base font-bold text-[#002244] leading-tight mb-2 group-hover:text-[#001833] transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      
                      <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2 mb-4 flex-1">
                        {excerpt}{stripHtml(article.content).length > 120 ? "..." : ""}
                      </p>

                      {/* Read More Link - Minimalist */}
                      <div className="mt-auto pt-3 border-t border-slate-50 flex items-center gap-1.5 text-[#002244] group-hover:text-[#FFC107] transition-colors text-[10px] font-bold uppercase tracking-widest">
                        <span>Baca</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Modern Pagination */}
            {totalPages > 1 && (
              <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-8">
                <span className="text-sm text-slate-400 font-medium order-2 sm:order-1">
                  Halaman <span className="text-[#002244] font-bold">{currentPage}</span> dari <span className="text-[#002244] font-bold">{totalPages}</span>
                </span>
                
                <nav className="flex items-center gap-3 order-1 sm:order-2">
                  {currentPage > 1 ? (
                    <Link
                      href={`/berita?page=${currentPage - 1}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-[#002244] hover:bg-slate-50 hover:border-[#002244] transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Kembali</span>
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-100 text-sm font-bold text-slate-200 cursor-not-allowed">
                      <ChevronLeft className="h-4 w-4" />
                      <span>Kembali</span>
                    </div>
                  )}

                  {currentPage < totalPages ? (
                    <Link
                      href={`/berita?page=${currentPage + 1}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002244] text-white text-sm font-bold hover:bg-[#001833] shadow-lg shadow-[#002244]/10 transition-all"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-300 text-sm font-bold cursor-not-allowed">
                      <span>Selanjutnya</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-slate-100 rounded-3xl">
            <Newspaper className="h-16 w-16 text-slate-100 mb-6" />
            <h3 className="text-xl font-bold text-[#002244] mb-2">Belum Ada Berita</h3>
            <p className="text-slate-400 max-w-xs mx-auto text-sm">Maaf, saat ini belum ada artikel atau berita yang diterbitkan. Silakan kembali lagi nanti.</p>
          </div>
        )}
      </section>

    </main>
  )
}
