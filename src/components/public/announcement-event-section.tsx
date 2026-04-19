"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarDays, MapPin, ArrowUpRight, Clock } from "lucide-react"
import Link from "next/link"
import type { Announcement, SchoolEvent } from "@prisma/client"

function formatEventDate(start: Date, end: Date | null) {
  return new Intl.DateTimeFormat("id-ID", { 
    day: "numeric", 
    month: "long", 
    year: end ? undefined : "numeric" 
  }).format(new Date(start))
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

interface Props {
  announcements: Announcement[]
  events: SchoolEvent[]
}

export function AnnouncementEventSection({ announcements, events }: Props) {
  if (announcements.length === 0 && events.length === 0) return null

  return (
    <section className="bg-slate-50 py-16 md:py-24 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Consistent Section Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 pb-4 border-b border-slate-200/60">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Pusat Informasi
              </h2>
              <p className="text-slate-500 mt-2 text-sm max-w-lg font-medium">
                Pantau pengumuman terbaru dan jadwal kegiatan penting sekolah kami di sini.
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Announcements Column */}
          <div>
            <FadeIn delay={100}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Pengumuman
                </h3>
                <Link href="/pengumuman" className="group flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
                  SEMUA <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              {announcements.length === 0 ? (
                <p className="text-slate-400 text-sm italic">Belum ada pengumuman.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.slice(0, 3).map((item, i) => (
                    <FadeIn key={item.id} delay={200 + i * 100}>
                      <Link href={`/pengumuman#${item.id}`} className="block group">
                        <div className="bg-white p-5 rounded-xl border border-slate-200/60 group-hover:border-blue-200 group-hover:shadow-md transition-all duration-300">
                          <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                            {item.title}
                          </h4>
                          {item.content && (
                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                              {item.content}
                            </p>
                          )}
                          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(item.createdAt))}
                          </div>
                        </div>
                      </Link>
                    </FadeIn>
                  ))}
                </div>
              )}
            </FadeIn>
          </div>

          {/* Events Column */}
          <div>
            <FadeIn delay={300}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                  Agenda Sekolah
                </h3>
                <Link href="/agenda" className="group flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors">
                  SEMUA <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              {events.length === 0 ? (
                <p className="text-slate-400 text-sm italic">Belum ada agenda.</p>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 3).map((event, i) => (
                    <FadeIn key={event.id} delay={400 + i * 100}>
                      <Link href={`/agenda#${event.id}`} className="block group">
                        <div className="bg-white p-5 rounded-xl border border-slate-200/60 group-hover:border-amber-200 group-hover:shadow-md transition-all duration-300 flex items-start gap-4">
                          {/* Date Block */}
                          <div className="flex flex-col items-center justify-center bg-slate-900 text-white rounded-lg w-12 h-14 shrink-0 transition-colors group-hover:bg-amber-600">
                            <span className="text-lg font-bold leading-none">
                              {new Date(event.startDate).getDate()}
                            </span>
                            <span className="text-[9px] uppercase font-bold opacity-70">
                              {new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(event.startDate))}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors mb-2 leading-tight">
                              {event.title}
                            </h4>
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                <CalendarDays className="h-3 w-3" />
                                {formatEventDate(event.startDate, event.endDate)}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </FadeIn>
                  ))}
                </div>
              )}
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  )
}
