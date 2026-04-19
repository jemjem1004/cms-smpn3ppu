import { describe, it, expect } from "vitest"
import {
  articleSchema,
  menuItemSchema,
  userSchema,
  staffSchema,
  galleryImageSchema,
  fileUploadSchema,
} from "@/lib/validators"

describe("articleSchema", () => {
  it("should accept valid article data", () => {
    const result = articleSchema.safeParse({
      title: "Berita Terbaru",
      content: "<p>Konten artikel</p>",
      slug: "berita-terbaru",
    })
    expect(result.success).toBe(true)
  })

  it("should accept article with optional fields", () => {
    const result = articleSchema.safeParse({
      title: "Berita",
      content: "Konten",
      slug: "berita",
      categoryId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      thumbnailUrl: "https://example.com/img.jpg",
    })
    expect(result.success).toBe(true)
  })

  it("should reject empty title", () => {
    const result = articleSchema.safeParse({
      title: "",
      content: "Konten",
      slug: "test",
    })
    expect(result.success).toBe(false)
  })

  it("should reject invalid slug with uppercase", () => {
    const result = articleSchema.safeParse({
      title: "Test",
      content: "Konten",
      slug: "Invalid-Slug",
    })
    expect(result.success).toBe(false)
  })

  it("should reject slug with spaces", () => {
    const result = articleSchema.safeParse({
      title: "Test",
      content: "Konten",
      slug: "invalid slug",
    })
    expect(result.success).toBe(false)
  })
})

describe("menuItemSchema", () => {
  it("should accept valid menu item", () => {
    const result = menuItemSchema.safeParse({
      label: "Beranda",
      url: "/",
      type: "INTERNAL",
      parentId: null,
      order: 0,
    })
    expect(result.success).toBe(true)
  })

  it("should accept external menu item with parentId", () => {
    const result = menuItemSchema.safeParse({
      label: "Google",
      url: "https://google.com",
      type: "EXTERNAL",
      parentId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      order: 1,
    })
    expect(result.success).toBe(true)
  })

  it("should reject empty label", () => {
    const result = menuItemSchema.safeParse({
      label: "",
      url: "/test",
      type: "INTERNAL",
      parentId: null,
      order: 0,
    })
    expect(result.success).toBe(false)
  })

  it("should reject negative order", () => {
    const result = menuItemSchema.safeParse({
      label: "Test",
      url: "/test",
      type: "INTERNAL",
      parentId: null,
      order: -1,
    })
    expect(result.success).toBe(false)
  })

  it("should reject invalid type", () => {
    const result = menuItemSchema.safeParse({
      label: "Test",
      url: "/test",
      type: "UNKNOWN",
      parentId: null,
      order: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe("userSchema", () => {
  it("should accept valid user data", () => {
    const result = userSchema.safeParse({
      name: "Admin",
      email: "admin@smkn1sby.sch.id",
      password: "password123",
      role: "SUPER_ADMIN",
    })
    expect(result.success).toBe(true)
  })

  it("should reject invalid email", () => {
    const result = userSchema.safeParse({
      name: "Admin",
      email: "not-an-email",
      password: "password123",
      role: "EDITOR",
    })
    expect(result.success).toBe(false)
  })

  it("should reject short password", () => {
    const result = userSchema.safeParse({
      name: "Admin",
      email: "admin@test.com",
      password: "short",
      role: "CONTRIBUTOR",
    })
    expect(result.success).toBe(false)
  })

  it("should reject invalid role", () => {
    const result = userSchema.safeParse({
      name: "Admin",
      email: "admin@test.com",
      password: "password123",
      role: "VIEWER",
    })
    expect(result.success).toBe(false)
  })
})

describe("staffSchema", () => {
  it("should accept valid staff data", () => {
    const result = staffSchema.safeParse({
      name: "Budi Santoso",
      position: "Guru Matematika",
      order: 0,
    })
    expect(result.success).toBe(true)
  })

  it("should accept staff with photo URL", () => {
    const result = staffSchema.safeParse({
      name: "Siti Rahayu",
      position: "Kepala Sekolah",
      photoUrl: "https://s3.amazonaws.com/photo.jpg",
      order: 1,
    })
    expect(result.success).toBe(true)
  })

  it("should reject empty position", () => {
    const result = staffSchema.safeParse({
      name: "Test",
      position: "",
      order: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe("galleryImageSchema", () => {
  it("should accept valid gallery image", () => {
    const result = galleryImageSchema.safeParse({
      title: "Upacara Bendera",
      imageUrl: "https://s3.amazonaws.com/gallery/img1.jpg",
      order: 0,
    })
    expect(result.success).toBe(true)
  })

  it("should accept gallery image with description", () => {
    const result = galleryImageSchema.safeParse({
      title: "Kegiatan OSIS",
      description: "Kegiatan OSIS semester genap",
      imageUrl: "https://example.com/img.jpg",
      order: 2,
    })
    expect(result.success).toBe(true)
  })

  it("should reject missing imageUrl", () => {
    const result = galleryImageSchema.safeParse({
      title: "Test",
      order: 0,
    })
    expect(result.success).toBe(false)
  })

  it("should reject description over 500 chars", () => {
    const result = galleryImageSchema.safeParse({
      title: "Test",
      description: "a".repeat(501),
      imageUrl: "https://example.com/img.jpg",
      order: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe("fileUploadSchema", () => {
  it("should accept valid JPEG upload", () => {
    const result = fileUploadSchema.safeParse({
      filename: "photo.jpg",
      contentType: "image/jpeg",
      size: 1024 * 1024, // 1MB
    })
    expect(result.success).toBe(true)
  })

  it("should accept valid PNG upload at max size", () => {
    const result = fileUploadSchema.safeParse({
      filename: "photo.png",
      contentType: "image/png",
      size: 5 * 1024 * 1024, // exactly 5MB
    })
    expect(result.success).toBe(true)
  })

  it("should reject file exceeding 5MB", () => {
    const result = fileUploadSchema.safeParse({
      filename: "large.jpg",
      contentType: "image/jpeg",
      size: 5 * 1024 * 1024 + 1,
    })
    expect(result.success).toBe(false)
  })

  it("should reject unsupported content type", () => {
    const result = fileUploadSchema.safeParse({
      filename: "doc.pdf",
      contentType: "application/pdf",
      size: 1024,
    })
    expect(result.success).toBe(false)
  })

  it("should accept WebP format", () => {
    const result = fileUploadSchema.safeParse({
      filename: "photo.webp",
      contentType: "image/webp",
      size: 2048,
    })
    expect(result.success).toBe(true)
  })
})
