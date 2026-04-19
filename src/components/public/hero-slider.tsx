"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"
import { ArrowRight } from "lucide-react"
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
    <div className="relative bg-[#002244]">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        plugins={[Autoplay({ delay: 6000, stopOnInteraction: false })]}
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

      {/* Modern Fashion-Editorial Dash indicators */}
      {count > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-30">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              className={`h-0.5 transition-all duration-500 ${
                i === current
                  ? "w-12 bg-yellow-400"
                  : "w-6 bg-white/20 hover:bg-white/60"
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
    <div className="relative w-full overflow-hidden bg-[#002244]">
      {/* Super subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Massive Editorial Watermark Typography */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] rotate-[-5deg] scale-150">
        <div className="text-[clamp(10rem,20vw,25rem)] font-black text-white leading-none tracking-tighter whitespace-nowrap">
          {slide.badgeLabel ? slide.badgeLabel.toUpperCase() : "ACADEMY"}
        </div>
      </div>

      {/* Architectural Grid Lines (Magazine margins) */}
      <div className="absolute left-[5%] top-0 bottom-0 w-px bg-white/[0.03] z-0" />
      <div className="absolute md:left-[50%] top-0 bottom-0 w-px bg-white/[0.03] z-0" />
      <div className="absolute right-[5%] top-0 bottom-0 w-px bg-white/[0.03] z-0" />
      <div className="absolute top-[15%] left-0 right-0 h-px bg-white/[0.03] z-0" />
      <div className="absolute bottom-[15%] left-0 right-0 h-px bg-white/[0.03] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center py-16 lg:py-8 min-h-[55vh] md:min-h-[60vh]">
        
        {/* Text Column */}
        <div className="w-full lg:w-1/2 pt-12 lg:pt-16 pb-12 pr-0 lg:pr-10">
          {/* Badge */}
          <div className="flex items-center gap-3 mb-5">
            <span className="w-6 h-px bg-yellow-400" />
            <span className="text-yellow-400 text-[11px] font-black uppercase tracking-[0.2em]">
              {slide.badgeLabel || "Pendidikan Khusus"}
            </span>
          </div>
          
          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            {slide.title}
          </h2>
          
          {/* Description */}
          <p className="text-blue-100/70 text-base md:text-lg font-medium leading-relaxed max-w-lg mb-8">
            {slide.description}
          </p>

          {/* Minimalist CTA */}
          <Link
            href={slide.ctaUrl || "/berita"}
            className="group flex items-center gap-4 text-white text-sm font-bold uppercase tracking-widest hover:text-yellow-400 transition-colors w-fit"
          >
            <span>{slide.ctaText || "Tinjau Selengkapnya"}</span>
            <span className="w-12 h-px bg-white group-hover:bg-yellow-400 group-hover:w-20 transition-all duration-300 ease-out" />
            <ArrowRight className="w-4 h-4 -ml-2 group-hover:ml-0 transition-all duration-300" />
          </Link>
        </div>

        {/* Image Column */}
        <div className="w-full lg:w-1/2 pb-16 lg:py-16 flex justify-center lg:justify-end">
          {/* Architectural Window Frame */}
          <div className="relative w-full max-w-[420px] aspect-[4/5] mx-auto lg:mx-0 mt-6 lg:mt-0 group">
             {/* Solid Geometric Offset Block */}
             <div className="absolute inset-0 bg-[#005b9f] translate-x-4 translate-y-4 rounded-br-[6rem] rounded-tl-[6rem] rounded-tr-md rounded-bl-md transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2 opacity-80 z-0" />
             
             {/* Actual Image Container */}
             <div className="absolute inset-0 bg-[#0a1829] z-10 overflow-hidden shadow-2xl rounded-br-[6rem] rounded-tl-[6rem] rounded-tr-md rounded-bl-md border border-white/10">
                {slide.imageUrl ? (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover object-center grayscale-[40%] contrast-110 transform transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/30 bg-[#0d2f52]">
                     <span className="text-xs uppercase tracking-widest font-bold">Direktori Visual</span>
                  </div>
                )}
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
