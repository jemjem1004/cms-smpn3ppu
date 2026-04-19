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
    },
    {
      title: "Total Galeri",
      value: stats.galleryCount,
      icon: Image,
    },
    {
      title: "Total Guru",
      value: stats.staffCount,
      icon: GraduationCap,
    },
    {
      title: "Total Pengguna",
      value: stats.userCount,
      icon: Users,
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-5 w-5" style={{ color: "#002244" }} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
