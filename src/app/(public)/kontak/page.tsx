import type { Metadata } from "next"
import { getSiteSettings } from "@/lib/queries"
import { MapPin, Phone, Mail, Globe } from "lucide-react"
import { KontakForm } from "./kontak-form"

export const metadata: Metadata = {
  title: "Kontak & Pengaduan",
  description: "Hubungi kami atau sampaikan pengaduan melalui WhatsApp.",
}

export default async function KontakPage() {
  const settings = await getSiteSettings()
  const { identity, contact } = settings

  return (
    <main className="bg-white min-h-screen">
      {/* Premium Hero Header */}
      <section className="relative bg-[#001833] pt-20 pb-28 overflow-hidden border-b-2 border-[#FFC107]/20">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFC107]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
              <span className="h-[1px] w-8 bg-[#FFC107]" />
              <span className="text-[#FFC107] text-xs font-bold uppercase tracking-widest">Layanan Informasi</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Kontak & <span className="text-[#FFC107]">Pengaduan</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto md:mx-0 leading-relaxed">
              Kami siap membantu Anda. Sampaikan pertanyaan, saran, atau pengaduan untuk meningkatkan kualitas layanan kami.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Kolom Kiri: Informasi Kontak */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-[#002244] mb-4">Informasi Kontak</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Gunakan informasi di bawah ini untuk menghubungi kami secara langsung atau kunjungi kantor pusat kami pada jam operasional.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {/* Alamat */}
                {contact.address && (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[#FFC107]/30 transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#FFC107] transition-colors duration-500">
                      <MapPin className="h-5 w-5 text-[#002244]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#002244] mb-1">Alamat Kantor</h3>
                      <p className="text-slate-600 text-[13px] leading-relaxed">{contact.address}</p>
                    </div>
                  </div>
                )}

                {/* Telepon */}
                {contact.phone && (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[#FFC107]/30 transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#FFC107] transition-colors duration-500">
                      <Phone className="h-5 w-5 text-[#002244]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#002244] mb-1">Telepon Utama</h3>
                      <p className="text-slate-600 text-[13px]">{contact.phone}</p>
                    </div>
                  </div>
                )}

                {/* Email */}
                {contact.email && (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[#FFC107]/30 transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#FFC107] transition-colors duration-500">
                      <Mail className="h-5 w-5 text-[#002244]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#002244] mb-1">Email Resmi</h3>
                      <p className="text-slate-600 text-[13px]">{contact.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Maps Card */}
            {contact.mapsEmbedUrl && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Visual Lokasi
                </h3>
                <div className="rounded-3xl overflow-hidden border-4 border-slate-50 shadow-2xl shadow-slate-200/50 aspect-video lg:aspect-auto lg:h-[280px] relative">
                  <iframe
                    src={contact.mapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    className="grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                    title={`Peta Lokasi ${identity.shortName}`}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-white/10 backdrop-blur-md border-t border-white/20 text-center pointer-events-none">
                    <span className="text-[10px] font-bold uppercase text-[#002244] tracking-[0.2em]">{identity.name}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Form Pengaduan */}
          <div className="lg:col-span-7">
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#FFC107]/10 rounded-3xl blur-2xl pointer-events-none" />
              <KontakForm
                whatsappNumber={contact.whatsapp ?? ""}
                schoolName={identity.name}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
