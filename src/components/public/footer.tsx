import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Map } from "lucide-react"
import { getSiteSettings } from "@/lib/queries"

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
    </svg>
  )
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

export async function Footer() {
  const settings = await getSiteSettings()
  const { identity, contact, social, footer } = settings

  const socialLinks = [
    social.youtube && { label: "YouTube", href: social.youtube, icon: <YoutubeIcon className="h-4 w-4" /> },
    social.instagram && { label: "Instagram", href: social.instagram, icon: <InstagramIcon className="h-4 w-4" /> },
    social.facebook && { label: "Facebook", href: social.facebook, icon: <FacebookIcon className="h-4 w-4" /> },
    social.tiktok && { label: "TikTok", href: social.tiktok, icon: <TiktokIcon className="h-4 w-4" /> },
  ].filter(Boolean) as { label: string; href: string; icon: React.ReactNode }[]

  const footerLinks: any[] = footer?.links ?? []

  return (
    <footer className="bg-[#002244] mt-16 relative overflow-hidden">
      {/* Subtle Background Pattern (Dot Grid) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1.5px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Gentle Ambient Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-[#FFC107]/5 pointer-events-none" />

      {/* Large Transparent Logo Element on the Right */}
      {identity.logoUrl && (
        <div className="absolute top-1/2 -right-32 -translate-y-1/2 opacity-[0.02] pointer-events-none blur-[2px] hidden lg:block">
          <Image
            src={identity.logoUrl}
            alt="Watermark"
            width={600}
            height={600}
            className="object-contain"
          />
        </div>
      )}

      {/* A thin yellow line indicating the separation */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC107]/50 to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-8 items-start">
          
          {/* Kolom 1: Identitas & Deskripsi */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col">
            <Link href="/" className="flex items-center gap-3 mb-4 group inline-flex max-w-fit">
              {identity.logoUrl ? (
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-white/5 p-2 ring-1 ring-white/10 group-hover:ring-[#FFC107]/50 transition-all duration-300">
                  <Image
                    src={identity.logoUrl}
                    alt={identity.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-[#FFC107] to-amber-600 shadow-sm text-[#002244] font-bold text-xl shrink-0 group-hover:shadow-[#FFC107]/20 transition-all">
                  {identity.shortName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl tracking-tight leading-none group-hover:text-[#FFC107] transition-colors">{identity.shortName}</span>
                {identity.tagline && <span className="text-[#FFC107]/70 text-xs mt-1 truncate max-w-[200px] font-medium">{identity.tagline}</span>}
              </div>
            </Link>

            <p className="text-white/60 text-sm leading-relaxed mb-5 max-w-md line-clamp-3">
              {identity.description}
            </p>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-white/5 border border-white/5 text-white/50 hover:bg-[#FFC107] hover:text-[#002244] hover:border-[#FFC107] transition-all duration-300"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Kolom 2: Tautan Cepat */}
          <div className="md:col-span-5 lg:col-span-3 flex flex-col pt-1">
            <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107]" />
              Tautan Cepat
            </h3>
            
            {footerLinks.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {footerLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-white/60 hover:text-[#FFC107] text-sm transition-colors"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#FFC107]" />
                      <span className="group-hover:-translate-x-1 transition-transform">{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/40 text-xs italic">Belum ada tautan terkait</p>
            )}
          </div>

          {/* Kolom 3: Lokasi Maps */}
          <div className="md:col-span-7 lg:col-span-5 flex flex-col pt-1">
            <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107]" />
              Lokasi Map
            </h3>
            
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 h-48 relative group shadow-sm">
              {contact.mapsEmbedUrl ? (
                <>
                  <div className="absolute inset-0 bg-[#002244] animate-pulse" />
                  <iframe
                    src={contact.mapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Lokasi ${identity.shortName}`}
                    className="relative z-10 w-full h-full grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <Map className="h-6 w-6 text-white/20 mb-2" />
                  <p className="text-white/40 text-xs">Belum ada lokasi map</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/5 bg-black/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/40 text-xs text-center md:text-left">
              &copy; {new Date().getFullYear()} <span className="text-white/70">{identity.name}</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-[0.65rem] text-white/30 tracking-wide">
              <span>developed by</span>
              <a href="#" className="font-semibold text-white/50 hover:text-[#FFC107] transition-colors cursor-pointer uppercase letter-spacing-wide">Astro digital solution</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

