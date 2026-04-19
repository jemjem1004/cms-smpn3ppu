import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Berita",
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
    <section className="bg-gray-50 min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#002244]">
            Berita &amp; Artikel
          </h1>
          <p className="mt-2 text-gray-500">
            Informasi terbaru seputar kegiatan dan perkembangan sekolah
          </p>
        </div>

        {articles.length > 0 ? (
          <>
            {/* Article Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const excerpt = stripHtml(article.content).slice(0, 150)
                return (
                  <Link
                    key={article.id}
                    href={`/berita/${article.slug}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/9] bg-gray-200">
                      {article.thumbnailUrl ? (
                        <Image
                          src={article.thumbnailUrl}
                          alt={article.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg
                            className="h-10 w-10 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {article.category && (
                        <span className="inline-block text-xs font-semibold text-[#FFC107] bg-[#FFC107]/10 px-2 py-0.5 rounded mb-2">
                          {article.category.name}
                        </span>
                      )}
                      <h2 className="text-lg font-bold text-[#002244] group-hover:text-[#003366] line-clamp-2 transition-colors">
                        {article.title}
                      </h2>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                        {excerpt}
                        {stripHtml(article.content).length > 150 ? "…" : ""}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                        <span>{article.author.name}</span>
                        <span>·</span>
                        <time>{formatDate(article.publishedAt)}</time>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/berita?page=${currentPage - 1}`}
                    className="px-4 py-2 text-sm font-medium text-[#002244] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Sebelumnya
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-gray-500">
                  Halaman {currentPage} dari {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`/berita?page=${currentPage + 1}`}
                    className="px-4 py-2 text-sm font-medium text-[#002244] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Selanjutnya →
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              className="h-16 w-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <p className="text-gray-400 text-lg">Belum ada berita</p>
          </div>
        )}
      </div>
    </section>
  )
}
