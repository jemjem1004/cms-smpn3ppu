import { getAnnouncements } from "@/actions/announcement"
import { getEvents } from "@/actions/event"
import { AnnouncementManager } from "@/components/admin/announcement-manager"
import { EventManager } from "@/components/admin/event-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata = {
  title: "Pengumuman & Agenda — Admin",
}

export default async function PengumumanPage() {
  const [announcementsResult, eventsResult] = await Promise.all([
    getAnnouncements(),
    getEvents(),
  ])

  const announcements = announcementsResult.success ? announcementsResult.data : []
  const events = eventsResult.success ? eventsResult.data : []

  return (
    <div className="p-6 md:p-8">
      <Tabs defaultValue="pengumuman">
        <TabsList className="mb-6">
          <TabsTrigger value="pengumuman">Pengumuman</TabsTrigger>
          <TabsTrigger value="agenda">Agenda Kegiatan</TabsTrigger>
        </TabsList>
        <TabsContent value="pengumuman">
          <AnnouncementManager initialItems={announcements} />
        </TabsContent>
        <TabsContent value="agenda">
          <EventManager initialItems={events} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
