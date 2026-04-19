"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

interface StaffMember {
  id: string
  name: string
  position: string
  photoUrl: string | null
}

interface StaffCarouselProps {
  staff: StaffMember[]
}

export function StaffCarousel({ staff }: StaffCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <div>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({ delay: 4000, stopOnInteraction: false }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-6 py-4">
          {staff.map((member) => (
            <CarouselItem
              key={member.id}
              className="pl-4 md:pl-6 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="flex flex-col p-3 rounded-3xl hover:bg-slate-50 transition-colors duration-300 group h-full cursor-grab active:cursor-grabbing">
                {/* Photo Container - Clean Portrait / Rectangle */}
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 mb-5">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
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

                {/* Minimalist Info Container */}
                <div className="flex flex-col px-1">
                  <h3 className="font-semibold text-slate-900 text-lg tracking-tight mb-1">
                    {member.name}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">
                    {member.position}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Pagination dots (Minimal) */}
      {count > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === current
                  ? "w-8 bg-blue-600"
                  : "w-2 bg-slate-200 hover:bg-slate-300"
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
