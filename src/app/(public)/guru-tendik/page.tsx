import type { Metadata } from "next"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Users, GraduationCap } from "lucide-react"

export const metadata: Metadata = {
  title: "Guru & Tenaga Kependidikan",
  description: "Daftar guru dan tenaga kependidikan sekolah.",
}

export default async function GuruTendikPage() {
  const staff = await prisma.staff.findMany({
    orderBy: { order: "asc" },
  })

  const totalStaff = staff.length;

  return (
    <main className="bg-white min-h-screen">
      
      {/* Premium Hero Header */}
      <section className="relative bg-[#001833] pt-20 pb-24 overflow-hidden border-b-2 border-[#FFC107]/20">
        {/* Ambient background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFC107]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <span className="h-[1px] w-8 bg-[#FFC107]" />
                <span className="text-[#FFC107] text-xs font-bold uppercase tracking-widest">Akademik</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                Tenaga <span className="text-[#FFC107]">Pendidik</span>
              </h1>
              <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto md:mx-0 leading-relaxed">
                Mengenal lebih dekat tim profesional kami yang berdedikasi tinggi dalam mendampingi setiap langkah perkembangan siswa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {totalStaff === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-10 w-10 text-slate-100 mb-4" />
            <p className="text-slate-400 font-medium">Data belum tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-10">
            {staff.map((person) => (
              <div
                key={person.id}
                className="group w-full"
              >
                {/* Photo wrapping - Ultra tight margin */}
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 mb-2 shadow-sm group-hover:shadow-md transition-all duration-300">
                  {person.photoUrl ? (
                    <Image
                      src={person.photoUrl}
                      alt={person.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-slate-50">
                      <span className="text-slate-300 font-bold text-2xl">
                        {person.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Information Section - Maximum compactness */}
                <div className="text-center px-1">
                  <h3 className="text-slate-900 font-bold text-[13px] sm:text-sm line-clamp-1 group-hover:text-[#002244] transition-colors leading-none mb-1">
                    {person.name}
                  </h3>
                  
                  {person.position && (
                    <p className="text-[#FFC107] text-[10px] font-bold uppercase tracking-tight line-clamp-1 leading-none">
                      {person.position}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  )
}
