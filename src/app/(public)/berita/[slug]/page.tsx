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
    select: { title: true, content: true, thumbnailUrl: true },
  })

  if (!article) {
    return { title: "Artikel Tidak Ditemukan — SMKN 1 Surabaya" }
  }

  const description = stripHtml(article.content).slice(0, 160)

  return {
    title: `${article.title} — SMKN 1 Surabaya`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      locale: "id_ID",
      siteName: "SMKN 1 Surabaya",
      ...(article.thumbnailUrl && {
        images: [{ url: article.thumbnailUrl }],
      }),
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
      </div>
    </article>
  )
}
