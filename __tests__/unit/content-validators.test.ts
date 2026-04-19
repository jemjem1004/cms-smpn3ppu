import { describe, it, expect } from "vitest"
import {
  heroContentSchema,
  profileContentSchema,
  principalContentSchema,
  departmentContentSchema,
  contentSectionSchemas,
} from "@/lib/validators"

describe("heroContentSchema", () => {
  const validSlide = {
    id: "slide-1",
    title: "Selamat Datang",
    description: "Deskripsi hero",
    imageUrl: "https://example.com/hero.jpg",
    badgeLabel: "Prestasi Siswa",
    ctaText: "Baca Lebih Lanjut",
    ctaUrl: "/berita/terbaru",
  }

  const validHero = { slides: [validSlide] }

  it("should accept valid hero content with slides", () => {
    expect(heroContentSchema.safeParse(validHero).success).toBe(true)
  })

  it("should accept multiple slides (up to 5)", () => {
    const multi = { slides: [validSlide, { ...validSlide, id: "slide-2" }, { ...validSlide, id: "slide-3" }] }
    expect(heroContentSchema.safeParse(multi).success).toBe(true)
  })

  it("should reject empty slides array", () => {
    expect(heroContentSchema.safeParse({ slides: [] }).success).toBe(false)
  })

  it("should reject slide with empty title", () => {
    expect(heroContentSchema.safeParse({ slides: [{ ...validSlide, title: "" }] }).success).toBe(false)
  })

  it("should reject missing slides field", () => {
    expect(heroContentSchema.safeParse({}).success).toBe(false)
  })

  it("should reject more than 5 slides", () => {
    const tooMany = { slides: Array.from({ length: 6 }, (_, i) => ({ ...validSlide, id: `s-${i}` })) }
    expect(heroContentSchema.safeParse(tooMany).success).toBe(false)
  })
})

describe("profileContentSchema", () => {
  const validProfile = {
    description: "Profil sekolah",
    videoUrl: "https://youtube.com/watch?v=abc",
    visi: "<p>Visi sekolah</p>",
    misi: "<p>Misi sekolah</p>",
    sejarah: "<p>Sejarah sekolah</p>",
  }

  it("should accept valid profile content", () => {
    expect(profileContentSchema.safeParse(validProfile).success).toBe(true)
  })

  it("should reject empty visi", () => {
    expect(profileContentSchema.safeParse({ ...validProfile, visi: "" }).success).toBe(false)
  })

  it("should reject missing misi", () => {
    const { misi, ...rest } = validProfile
    expect(profileContentSchema.safeParse(rest).success).toBe(false)
  })
})

describe("principalContentSchema", () => {
  const validPrincipal = {
    message: "Prakata kepala sekolah",
    name: "Dr. Budi Santoso",
    title: "Kepala Sekolah",
    photoUrl: "https://example.com/photo.jpg",
  }

  it("should accept valid principal content", () => {
    expect(principalContentSchema.safeParse(validPrincipal).success).toBe(true)
  })

  it("should reject empty name", () => {
    expect(principalContentSchema.safeParse({ ...validPrincipal, name: "" }).success).toBe(false)
  })

  it("should reject empty message", () => {
    expect(principalContentSchema.safeParse({ ...validPrincipal, message: "" }).success).toBe(false)
  })
})

describe("departmentContentSchema", () => {
  const validDepartment = {
    departments: [
      {
        id: "dept-1",
        name: "Teknik Komputer dan Jaringan",
        description: "Jurusan TKJ",
        imageUrl: "https://example.com/tkj.jpg",
      },
    ],
  }

  it("should accept valid department content", () => {
    expect(departmentContentSchema.safeParse(validDepartment).success).toBe(true)
  })

  it("should accept multiple departments", () => {
    const data = {
      departments: [
        { id: "d1", name: "TKJ", description: "Desc", imageUrl: "https://example.com/1.jpg" },
        { id: "d2", name: "RPL", description: "Desc", imageUrl: "https://example.com/2.jpg" },
      ],
    }
    expect(departmentContentSchema.safeParse(data).success).toBe(true)
  })

  it("should reject empty departments array", () => {
    expect(departmentContentSchema.safeParse({ departments: [] }).success).toBe(false)
  })

  it("should reject department with empty name", () => {
    const data = {
      departments: [{ id: "d1", name: "", description: "Desc", imageUrl: "https://example.com/1.jpg" }],
    }
    expect(departmentContentSchema.safeParse(data).success).toBe(false)
  })

  it("should reject department missing id", () => {
    const data = {
      departments: [{ name: "TKJ", description: "Desc", imageUrl: "https://example.com/1.jpg" }],
    }
    expect(departmentContentSchema.safeParse(data).success).toBe(false)
  })
})

describe("contentSectionSchemas mapping", () => {
  it("should have schemas for all four sections", () => {
    expect(contentSectionSchemas.HERO).toBe(heroContentSchema)
    expect(contentSectionSchemas.PROFILE).toBe(profileContentSchema)
    expect(contentSectionSchemas.PRINCIPAL_MESSAGE).toBe(principalContentSchema)
    expect(contentSectionSchemas.DEPARTMENT).toBe(departmentContentSchema)
  })
})
