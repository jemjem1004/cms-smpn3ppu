import type { Metadata } from "next"
import { HeroSection } from "@/components/public/hero-section"
import { ProfileNewsSection } from "@/components/public/profile-news-section"
import { PrincipalSection } from "@/components/public/principal-section"
import { GallerySection } from "@/components/public/gallery-section"
import { StaffSlider } from "@/components/public/staff-slider"

export const metadata: Metadata = {
  title: "SMKN 1 Surabaya — Sekolah Menengah Kejuruan Negeri 1 Surabaya",
  description:
    "Website resmi SMKN 1 Surabaya. Mencetak generasi unggul, kompeten, dan siap bersaing di era global. Informasi profil sekolah, berita terbaru, galeri, dan data guru.",
  openGraph: {
    title: "SMKN 1 Surabaya — Sekolah Menengah Kejuruan Negeri 1 Surabaya",
    description:
      "Website resmi SMKN 1 Surabaya. Mencetak generasi unggul, kompeten, dan siap bersaing di era global.",
    type: "website",
    locale: "id_ID",
    siteName: "SMKN 1 Surabaya",
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProfileNewsSection />
      <PrincipalSection />
      <StaffSlider />
      <GallerySection />
    </>
  )
}
