import Image from "next/image"
import { prisma } from "@/lib/prisma"
import type { PrincipalContent } from "@/types"

const DEFAULT_PRINCIPAL: PrincipalContent = {
  message:
    "Selamat datang di website resmi sekolah kami. Kami berkomitmen untuk mencetak lulusan yang kompeten, berkarakter, dan siap menghadapi tantangan dunia kerja maupun dunia usaha.",
  name: "Kepala Sekolah",
  title: "Kepala Sekolah",
  photoUrl: "",
}

export async function PrincipalSection() {
  const record = await prisma.institutionalContent.findUnique({
    where: { section: "PRINCIPAL_MESSAGE" },
  })

  const principal: PrincipalContent = record
    ? (record.content as unknown as PrincipalContent)
    : DEFAULT_PRINCIPAL

  if (!principal.message && !principal.name) {
    return null
  }

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{
        backgroundColor: "#004d80",
        backgroundImage:
          "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.12) 1px, transparent 0)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-end gap-6 lg:gap-10">

          {/* Teks — kiri */}
          <div className="flex-1 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Prakata Kepala Sekolah
            </h2>
            <div
              className="text-sm md:text-[15px] leading-relaxed text-blue-100/90"
              dangerouslySetInnerHTML={{ __html: principal.message }}
            />
            <div className="mt-4">
              <p className="font-bold text-base">{principal.name}</p>
              <p className="text-sm text-yellow-300">{principal.title}</p>
            </div>
          </div>

          {/* Foto — kanan, keluar ke atas (overflow) */}
          <div className="relative shrink-0 self-end hidden lg:block" style={{ width: "380px", height: "420px", marginBottom: "-1px" }}>
            {principal.photoUrl ? (
              <Image
                src={principal.photoUrl}
                alt={principal.name}
                fill
                sizes="380px"
                className="object-contain object-bottom drop-shadow-2xl"
              />
            ) : (
              <div className="absolute bottom-0 w-full h-[340px] bg-white/5 rounded-t-2xl flex items-center justify-center">
                <svg className="h-16 w-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Foto mobile */}
          <div className="relative w-56 h-64 self-center lg:hidden" style={{ marginBottom: "-1px" }}>
            {principal.photoUrl ? (
              <Image
                src={principal.photoUrl}
                alt={principal.name}
                fill
                sizes="224px"
                className="object-contain object-bottom drop-shadow-xl"
              />
            ) : (
              <div className="absolute bottom-0 w-full h-44 bg-white/5 rounded-t-xl flex items-center justify-center">
                <svg className="h-12 w-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
