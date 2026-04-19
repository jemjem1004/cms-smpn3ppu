import { prisma } from "@/lib/prisma"
import { StaffCarousel } from "./staff-carousel"

export async function StaffSlider() {
  const staff = await prisma.staff.findMany({
    orderBy: { order: "asc" },
  })

  if (staff.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#002244] border-l-4 border-[#0066CC] pl-4">
            Guru &amp; Tenaga Kependidikan
          </h2>
        </div>

        <StaffCarousel
          staff={staff.map((s) => ({
            id: s.id,
            name: s.name,
            position: s.position,
            photoUrl: s.photoUrl,
          }))}
        />
      </div>
    </section>
  )
}
