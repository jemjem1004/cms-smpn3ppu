import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { ProfileContent } from "@/types"

const DEFAULT_PROFILE: ProfileContent = {
  description:
    "SMKN 1 Surabaya adalah sekolah menengah kejuruan negeri yang berkomitmen mencetak lulusan berkualitas dan siap kerja.",
  videoUrl: "",
  visi: "",
  misi: "",
  sejarah: "",
}

function formatDate(date: Date | null): string {
  if (!date) return ""
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

/**
 * Extracts a YouTube embed URL from various YouTube URL formats.
 * Returns null if the URL is not a recognized YouTube link.
 */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    // Already an embed URL
    if (parsed.pathname.startsWith("/embed/")) return url
    // Standard watch URL
    const videoId =
      parsed.searchParams.get("v") ||
      (parsed.hostname === "youtu.be" ? parsed.pathname.slice(1) : null)
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  } catch {
    // not a valid URL
  }
  return null
}

export async function ProfileNewsSection() {
  const [profileRecord, latestArticles] = await Promise.all([
    prisma.institutionalContent.findUnique({ where: { section: "PROFILE" } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", isDeleted: false },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        publishedAt: true,
      },
    }),
  ])


  const profile: ProfileContent = profileRecord
    ? (profileRecord.content as unknown as ProfileContent)
    : DEFAULT_PROFILE

  const embedUrl = getYouTubeEmbedUrl(profile.videoUrl)

  return (
    <section className="bg-slate-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left column — Profile + Video (7/12) */}
          <div className="w-full lg:w-7/12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 tracking-tight relative pb-4">
              Profil SMK Negeri 1 Surabaya
              <span className="absolute bottom-0 left-0 w-16 h-1.5 bg-blue-600 rounded-full" />
            </h2>

            {/* Video */}
            {profile.videoUrl ? (
              embedUrl ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl mb-8 group ring-1 ring-black/5 bg-slate-900 border border-slate-200">
                  <iframe
                    src={embedUrl}
                    title="Profil SMK Negeri 1 Surabaya"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : (
                /* Non-YouTube video link with play button overlay */
                <a
                  href={profile.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-video rounded-2xl overflow-hidden shadow-xl mb-8 bg-slate-900 group ring-1 ring-black/5"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="h-20 w-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-500/50 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="h-10 w-10 text-white ml-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#002244] border-2 border-white flex items-center justify-center p-1">
                      <span className="text-[#FFC107] font-bold text-[10px]">S1</span>
                    </div>
                    <span className="font-bold text-white drop-shadow-md text-sm">PROFIL TERBARU SMKN 1</span>
                  </div>
                </a>
              )
            ) : (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 mb-8 flex items-center justify-center border border-slate-300 shadow-sm">
                <span className="text-slate-500 font-medium">
                  Video belum tersedia
                </span>
              </div>
            )}

            {/* Description */}
            <p className="text-slate-600 leading-relaxed text-lg font-light">
              {profile.description}
            </p>
          </div>

          {/* Right column — Latest News (5/12) */}
          <div className="w-full lg:w-5/12 pt-2 lg:pt-0">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Berita Terbaru
              </h2>
              <Link
                href="/berita"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-full hover:bg-blue-50"
              >
                Lebih Banyak &rarr;
              </Link>
            </div>

            {latestArticles.length > 0 ? (
              <div className="space-y-5">
                {latestArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/berita/${article.slug}`}
                    className="flex gap-5 group rounded-xl p-3 -mx-3 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-24 w-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200 shadow-sm">
                      {article.thumbnailUrl ? (
                        <Image
                          src={article.thumbnailUrl}
                          alt={article.title}
                          fill
                          sizes="128px"
                          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg
                            className="h-8 w-8 text-slate-400"
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

                    {/* Title + Date */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 line-clamp-2 transition-colors mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-auto">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {formatDate(article.publishedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
                <p className="text-slate-400 text-sm font-medium">
                  Belum ada berita terbaru
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
