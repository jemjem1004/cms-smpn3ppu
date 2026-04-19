import Image from "next/image"
import { prisma } from "@/lib/prisma"
import type { PrincipalContent } from "@/types"

const DEFAULT_PRINCIPAL: PrincipalContent = {
  message:
    "Selamat datang di website resmi SMKN 1 Surabaya. Kami berkomitmen untuk mencetak lulusan yang kompeten, berkarakter, dan siap menghadapi tantangan dunia kerja maupun dunia usaha.",
  name: "Kepala Sekolah",
  title: "Kepala SMKN 1 Surabaya",
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
      className="text-white py-16"
      style={{
        backgroundColor: '#004d80',
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          
          {/* Teks Prakata */}
          <div className="lg:w-8/12 space-y-4">
            <h3 className="text-2xl lg:text-3xl font-bold mb-6">Prakata Kepala Sekolah</h3>
            
            <div
              className="text-sm lg:text-base leading-relaxed text-blue-100 italic"
              dangerouslySetInnerHTML={{ __html: principal.message }}
            />
            
            <div className="pt-4">
              <p className="font-bold text-lg uppercase">{principal.name}</p>
              <p className="text-sm text-yellow-300">{principal.title}</p>
            </div>
          </div>

          {/* Foto Kepala Sekolah */}
          <div className="lg:w-4/12 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Bingkai kuning tipis ala referensi */}
              <div className="absolute -inset-2 border border-yellow-400 rounded"></div>
              {principal.photoUrl ? (
                <div className="relative z-10 w-64 h-80 rounded overflow-hidden shadow-lg grayscale">
                  <Image
                    src={principal.photoUrl}
                    alt={principal.name}
                    fill
                    sizes="(max-width: 768px) 256px, 256px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative z-10 w-64 h-80 rounded overflow-hidden shadow-lg grayscale bg-white/10 flex items-center justify-center">
                  <svg
                    className="h-16 w-16 text-white/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
