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
        <CarouselContent className="-ml-4">
          {staff.map((member) => (
            <CarouselItem
              key={member.id}
              className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="flex flex-col items-center text-center p-4">
                {/* Circular grayscale photo */}
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 bg-gray-200">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      fill
                      sizes="128px"
                      className="object-cover grayscale"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12"
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

                {/* Name */}
                <h3 className="font-bold text-[#002244] text-sm md:text-base leading-tight">
                  {member.name}
                </h3>

                {/* Position */}
                <p className="text-[#0066CC] text-xs md:text-sm mt-1">
                  {member.position}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Pagination dots */}
      {count > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === current
                  ? "w-6 bg-[#0066CC]"
                  : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
