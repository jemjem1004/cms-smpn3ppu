"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import type { HeroSlide } from "@/types"

interface HeroSliderProps {
  slides: HeroSlide[]
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  // Single slide — no carousel needed
  if (slides.length === 1) {
    const slide = slides[0]
    return <SingleSlide slide={slide} />
  }

  return (
    <div>
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <SingleSlide slide={slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-7 bg-white"
                  : "w-2.5 bg-white/40 hover:bg-white/60"
              }`}
              onClick={() => api?.scrollTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SingleSlide({ slide }: { slide: HeroSlide }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-10">
      {/* Text */}
      <div className="lg:w-1/2 space-y-6">
        <div className="inline-block bg-green-500 text-white px-3 py-1 text-xs font-bold rounded shadow-lg uppercase tracking-wider">
          {slide.badgeLabel}
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-white">
          {slide.title}
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
          {slide.description}
        </p>
        <Link
          href={slide.ctaUrl || "/berita"}
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors"
        >
          {slide.ctaText || "Baca Lebih Lanjut"}
        </Link>
      </div>

      {/* Image */}
      <div className="lg:w-1/2 w-full flex justify-center lg:justify-end">
        <div className="relative w-full max-w-lg aspect-[4/3] rounded-lg overflow-hidden border-4 border-white/10">
          {slide.imageUrl ? (
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-[#005b9f] flex items-center justify-center">
              <span className="text-white/30 text-sm">Gambar belum tersedia</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
