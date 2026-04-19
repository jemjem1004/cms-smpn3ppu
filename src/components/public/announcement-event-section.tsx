import { getActiveAnnouncements } from "@/actions/announcement"
import { getUpcomingEvents } from "@/actions/event"
import { CalendarDays, MapPin, ArrowUpRight } from "lucide-react"
import Link from "next/link"

function formatEventDate(start: Date, end: Date | null) {
  const startStr = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long" }).format(new Date(start))
  if (!end) return startStr
  const endStr = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(end))
  return `${startStr} – ${endStr}`
}

export async function AnnouncementEventSection() {
  const [announcements, events] = await Promise.all([
    getActiveAnnouncements(),
    getUpcomingEvents(),
  ])

  if (announcements.length === 0 && events.length === 0) return null

  return (
    <section className="bg-slate-50/40 border-y border-slate-200/50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Unified Minimalist Header */}
        <div className="mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#002244] tracking-tight">Pusat Informasi</h2>
          <div className="w-16 h-1.5 bg-yellow-400 mt-5 opacity-90" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Announcements Editorial Column */}
          <div className="lg:col-span-7">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 pb-4 border-b-2 border-slate-100 flex items-center justify-between">
              Pengumuman Terbaru
              <Link href="/pengumuman" className="group flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors normal-case tracking-normal">
                Lihat Semua <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </h3>
            
            {announcements.length === 0 ? (
              <p className="text-slate-500 font-medium italic">Belum ada pengumuman baru.</p>
            ) : (
              <div className="flex flex-col">
                {announcements.map((item, idx) => (
                  <div key={item.id} className={`group py-6 ${idx !== 0 ? 'border-t border-slate-100' : ''}`}>
                    <div className="flex items-start gap-4">
                      {/* Subtle structural dot changing on hover */}
                      <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 group-hover:bg-blue-500 group-hover:scale-150 transition-all duration-300" />
                      <div>
                        <h4 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        {item.content && (
                          <p className="text-slate-700 mt-2.5 leading-relaxed">
                            {item.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agenda Editorial Column */}
          <div className="lg:col-span-5 relative">
            {/* Subtle column separator visible only on large screens */}
            <div className="hidden lg:block absolute left-[-2.5rem] top-0 bottom-0 w-px bg-slate-100" />
            
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 pb-4 border-b-2 border-slate-100 flex items-center justify-between">
              Agenda Mendatang
              <Link href="/agenda" className="group flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors normal-case tracking-normal">
                Lihat Semua <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </h3>

            {events.length === 0 ? (
              <p className="text-slate-500 font-medium italic">Belum ada jadwal acara.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {events.map((event) => (
                  <div key={event.id} className="group flex gap-6 pt-4 pb-6 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors">
                    
                    {/* Typographic Date Presentation */}
                    <div className="flex flex-col items-center pt-1 shrink-0 w-12">
                      <span className="text-3xl font-black text-[#002244] leading-none group-hover:text-blue-600 transition-colors">
                        {new Date(event.startDate).getDate().toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mt-2">
                        {new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(event.startDate))}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="text-sm text-slate-600 mt-2 flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 opacity-70" />
                        {formatEventDate(event.startDate, event.endDate)}
                      </p>
                      {event.location && (
                        <p className="text-sm text-slate-600 mt-1.5 flex items-center gap-2 line-clamp-1">
                          <MapPin className="h-3.5 w-3.5 opacity-70" /> {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
