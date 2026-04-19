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
    <div className="pb-8">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({ delay: 3000, stopOnInteraction: false }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-3 py-4">
          {staff.map((member) => (
            <CarouselItem
              key={member.id}
              // basis changes: Slightly larger. 4 items on desktop, 3 on tablet.
              className="pl-3 md:pl-4 basis-[60%] sm:basis-[40%] md:basis-[33.333%] lg:basis-[25%]"
            >
              <div className="flex flex-col p-3 rounded-2xl hover:bg-slate-50 transition-colors duration-300 group h-full cursor-grab active:cursor-grabbing border border-transparent hover:border-slate-100">
                {/* Photo Container - Clean Portrait / Rectangle (Medium-Small) */}
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-sm">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 60vw, 25vw"
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

                {/* Info Container (Slightly larger typography) */}
                <div className="flex flex-col px-1.5">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-[15px] leading-tight mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold line-clamp-1">
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
