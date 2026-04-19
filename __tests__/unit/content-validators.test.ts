import { describe, it, expect } from "vitest"
import {
  heroContentSchema,
  profileContentSchema,
  principalContentSchema,
  departmentContentSchema,
  contentSectionSchemas,
} from "@/lib/validators"

describe("heroContentSchema", () => {
  const validHero = {
    title: "Selamat Datang",
    description: "Deskripsi hero",
    imageUrl: "https://example.com/hero.jpg",
    badgeLabel: "Prestasi Siswa",
    ctaText: "Baca Lebih Lanjut",
    ctaUrl: "/berita/terbaru",
  }

  it("should accept valid hero content", () => {
    expect(heroContentSchema.safeParse(validHero).success).toBe(true)
  })

  it("should reject empty title", () => {
    expect(heroContentSchema.safeParse({ ...validHero, title: "" }).success).toBe(false)
  })

  it("should reject missing description", () => {
    const { description, ...rest } = validHero
    expect(heroContentSchema.safeParse(rest).success).toBe(false)
  })

  it("should reject empty imageUrl", () => {
    expect(heroContentSchema.safeParse({ ...validHero, imageUrl: "" }).success).toBe(false)
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
