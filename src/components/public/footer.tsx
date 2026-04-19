import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail } from "lucide-react"
import { getSiteSettings } from "@/lib/queries"

const quickLinks = [
  { label: "Beranda", href: "/" },
  { label: "Profil", href: "/profil" },
  { label: "Berita", href: "/berita" },
  { label: "Galeri", href: "/galeri" },
]

const infoLinks = [
  { label: "Visi & Misi", href: "/profil#visi-misi" },
  { label: "Jurusan", href: "/profil#jurusan" },
  { label: "Kontak", href: "/kontak" },
  { label: "Penerimaan Siswa Baru", href: "/ppdb" },
]

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
  const { identity, contact, social } = settings

  // Build social links array from settings
  const socialLinks = [
    social.facebook && { label: "Facebook", href: social.facebook, icon: <FacebookIcon className="h-4 w-4" /> },
    social.instagram && { label: "Instagram", href: social.instagram, icon: <InstagramIcon className="h-4 w-4" /> },
    social.youtube && { label: "YouTube", href: social.youtube, icon: <YoutubeIcon className="h-4 w-4" /> },
    social.tiktok && { label: "TikTok", href: social.tiktok, icon: <TiktokIcon className="h-4 w-4" /> },
  ].filter(Boolean) as { label: string; href: string; icon: React.ReactNode }[]

  return (
    <footer className="bg-[#002244] border-t-4 border-[#FFC107]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: School Identity + Social Media */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {identity.logoUrl ? (
                <Image
                  src={identity.logoUrl}
                  alt={identity.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-[#FFC107] text-[#002244] font-bold text-sm">
                  {identity.shortName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
              )}
              <span className="text-white font-bold text-lg tracking-tight">
                {identity.shortName} <span className="text-[#FFC107]">{identity.tagline}</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              {identity.description}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 text-white/70 hover:bg-[#FFC107] hover:text-[#002244] transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Tautan Cepat
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-[#FFC107] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Information */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Informasi
            </h3>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-[#FFC107] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Kontak
            </h3>
            <ul className="space-y-3">
              {contact.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#FFC107] mt-0.5 shrink-0" />
                  <span className="text-white/60 text-sm">{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#FFC107] shrink-0" />
                  <span className="text-white/60 text-sm">{contact.phone}</span>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#FFC107] shrink-0" />
                  <span className="text-white/60 text-sm">{contact.email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-white/40 text-sm">
            &copy; {new Date().getFullYear()} {identity.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
