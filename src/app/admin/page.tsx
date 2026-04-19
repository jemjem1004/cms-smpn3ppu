import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FileText, Image, GraduationCap, Users } from "lucide-react"

async function getDashboardStats() {
  const [articleCount, galleryCount, staffCount, userCount] = await Promise.all([
    prisma.article.count({ where: { isDeleted: false } }),
    prisma.galleryImage.count(),
    prisma.staff.count(),
    prisma.user.count({ where: { isActive: true } }),
  ])

  return { articleCount, galleryCount, staffCount, userCount }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    {
      title: "Total Artikel",
      value: stats.articleCount,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      description: "Artikel & berita dipublikasi"
    },
    {
      title: "File Galeri",
      value: stats.galleryCount,
      icon: Image,
      color: "text-[#FFC107]",
      bgColor: "bg-[#FFC107]/10",
      description: "Aset foto dalam album web"
    },
    {
      title: "Tenaga Pengajar",
      value: stats.staffCount,
      icon: GraduationCap,
      color: "text-emerald-600",
      bgColor: "bg-emerald-600/10",
      description: "Daftar guru & staff aktif"
    },
    {
      title: "Akun Pengguna",
      value: stats.userCount,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-600/10",
      description: "Administrator sistem"
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Ringkasan statistik ruang publikasi digital SMKN 1 Surabaya
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card 
            key={card.title} 
            className="border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group overflow-hidden relative"
          >
            {/* Subtle Top Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-blue-500 transition-colors" />
            
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-slate-900 mb-1">{card.value}</p>
              <p className="text-xs text-slate-400 font-medium">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Optional: Empty state placeholder or graph container for a dashboard feel */}
      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 min-h-[300px] flex items-center justify-center">
         <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
               <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Aktivitas Terkini</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Ruang untuk integrasi grafik statistik web atau log aktivitas pada versi selanjutnya.</p>
         </div>
      </div>
    </div>
  )
}
