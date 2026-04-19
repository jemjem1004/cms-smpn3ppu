import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, content: true, thumbnailUrl: true, metaTitle: true, metaDesc: true },
  })

  if (!article) return { title: "Artikel Tidak Ditemukan" }

  const title = article.metaTitle || article.title
  const description = article.metaDesc || stripHtml(article.content).slice(0, 160)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "id_ID",
      ...(article.thumbnailUrl && { images: [{ url: article.thumbnailUrl }] }),
    },
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
  })

  if (!article || article.status !== "PUBLISHED" || article.isDeleted) {
    notFound()
  }

  // Fetch related articles from same category (exclude current)
  const relatedArticles = article.categoryId
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          isDeleted: false,
          categoryId: article.categoryId,
          id: { not: article.id },
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: { title: true, slug: true, thumbnailUrl: true, publishedAt: true },
      })
    : []

  return (
    <article className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Back link */}
        <Link
          href="/berita"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#002244] transition-colors mb-8"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali ke Berita
        </Link>

        {/* Category badge */}
        {article.category && (
          <span className="inline-block text-xs font-semibold text-[#FFC107] bg-[#FFC107]/10 px-3 py-1 rounded-full mb-4">
            {article.category.name}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#002244] leading-tight">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="font-medium text-gray-700">
            {article.author.name}
          </span>
          <span>·</span>
          <time>{formatDate(article.publishedAt)}</time>
        </div>

        {/* Thumbnail */}
        {article.thumbnailUrl && (
          <div className="relative mt-8 aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article content */}
        <div
          className="prose prose-lg max-w-none mt-10 prose-headings:text-[#002244] prose-a:text-blue-600 prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-14 pt-10 border-t border-gray-100">
            <h2 className="text-xl font-bold text-[#002244] mb-6">
              Artikel Terkait
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/berita/${related.slug}`}
                  className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="relative aspect-[16/9] bg-gray-100">
                    {related.thumbnailUrl ? (
                      <Image
                        src={related.thumbnailUrl}
                        alt={related.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="text-sm font-bold text-[#002244] group-hover:text-blue-600 line-clamp-2 transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(related.publishedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
