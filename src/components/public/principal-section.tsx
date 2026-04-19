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
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        backgroundColor: "#0f172a",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.05) 1.5px, transparent 1.5px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/80 via-transparent to-[#0f172a]/90 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left — Prakata text (8/12) */}
          <div className="w-full lg:w-8/12 relative">
            <div className="absolute -left-6 -top-6 text-8xl text-white/5 font-serif select-none pointer-events-none">"</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-8 tracking-tight">
              Prakata Kepala Sekolah
            </h2>

            <div
              className="text-slate-300 italic leading-loose text-base md:text-lg mb-8"
              dangerouslySetInnerHTML={{ __html: principal.message }}
            />

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-white font-extrabold text-xl tracking-wide uppercase">{principal.name}</p>
              <p className="text-[#FFC107] text-sm font-semibold mt-1 tracking-wider">{principal.title}</p>
            </div>
          </div>

          {/* Right — Photo (4/12) */}
          <div className="w-full lg:w-4/12 flex justify-center lg:justify-end relative">
            <div className="absolute inset-0 bg-[#FFC107] rounded-full blur-[60px] opacity-20 mix-blend-screen" />
            {principal.photoUrl ? (
              <div className="relative h-64 w-64 md:h-[320px] md:w-[250px] md:rounded-2xl rounded-full overflow-hidden shadow-2xl border border-white/10 ring-4 ring-[#FFC107]/20 group">
                <Image
                  src={principal.photoUrl}
                  alt={principal.name}
                  fill
                  sizes="(max-width: 768px) 256px, 288px"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            ) : (
              <div className="h-64 w-64 md:h-[320px] md:w-[250px] md:rounded-2xl rounded-full border border-white/10 ring-4 ring-[#FFC107]/20 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-2xl">
                <svg
                  className="h-20 w-20 text-white/30"
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
    </section>
  )
}
