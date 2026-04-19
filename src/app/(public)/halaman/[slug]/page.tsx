import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/actions/page"

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const page = await getPageBySlug(params.slug)
  if (!page) return { title: "Halaman Tidak Ditemukan — SMKN 1 Surabaya" }
  return {
    title: `${page.title} — SMKN 1 Surabaya`,
    openGraph: {
      title: page.title,
      type: "website",
      locale: "id_ID",
      siteName: "SMKN 1 Surabaya",
    },
  }
}

export default async function PublicPageDetail({
  params,
}: {
  params: { slug: string }
}) {
  const page = await getPageBySlug(params.slug)

  if (!page) {
    notFound()
  }

  return (
    <article className="bg-white min-h-screen">
      {/* Page header */}
      <div className="bg-[#002244] text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold">{page.title}</h1>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div
          className="prose prose-lg max-w-none prose-headings:text-[#002244] prose-a:text-blue-600 prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </article>
  )
}
