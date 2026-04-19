import { getActiveAnnouncements } from "@/actions/announcement"
import { Info, AlertTriangle, CheckCircle } from "lucide-react"

const TYPE_STYLES: Record<string, { bg: string; icon: any }> = {
  INFO: {
    bg: "bg-blue-600",
    icon: Info,
  },
  WARNING: {
    bg: "bg-amber-500",
    icon: AlertTriangle,
  },
  SUCCESS: {
    bg: "bg-green-600",
    icon: CheckCircle,
  },
}

export async function AnnouncementBanner() {
  const announcements = await getActiveAnnouncements()
  if (announcements.length === 0) return null

  // Tampilkan hanya pengumuman pertama/terbaru sebagai banner
  const latest = announcements[0]
  const style = TYPE_STYLES[latest.type] || TYPE_STYLES.INFO
  const Icon = style.icon

  return (
    <div className={`${style.bg} text-white py-2.5 px-4`}>
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 opacity-90" />
        <p className="text-sm font-medium flex-1 text-center">
          <span className="font-bold">{latest.title}</span>
          {latest.content && <span className="opacity-90 hidden sm:inline"> — {latest.content}</span>}
        </p>
      </div>
    </div>
  )
}
