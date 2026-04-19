"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac"
import { z } from "zod"

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(100),
  slug: z.string().min(1, "Slug wajib diisi").max(100).regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Get all categories with article count
 */
export async function getCategories(): Promise<ActionResult<{
  id: string
  name: string
  slug: string
  _count: { articles: number }
}[]>> {
  try {
    await requirePermission("article:create")

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    return { success: true, data: categories }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat mengambil kategori" }
  }
}


/**
 * Create a new category
 */
export async function createCategory(data: {
  name: string
  slug?: string
}): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    await requirePermission("article:publish") // Only editors and above can manage categories

    const slug = data.slug || generateSlug(data.name)
    
    const validated = categorySchema.safeParse({ name: data.name, slug })
    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    // Check for duplicate slug
    const existing = await prisma.category.findUnique({
      where: { slug: validated.data.slug }
    })
    if (existing) {
      return {
        success: false,
        error: "Slug sudah digunakan",
        fieldErrors: { slug: ["Slug sudah digunakan oleh kategori lain"] }
      }
    }

    const category = await prisma.category.create({
      data: {
        name: validated.data.name,
        slug: validated.data.slug,
      }
    })

    return { success: true, data: category }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat membuat kategori" }
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  data: { name: string; slug?: string }
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    await requirePermission("article:publish")

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: "Kategori tidak ditemukan" }
    }

    const slug = data.slug || generateSlug(data.name)
    
    const validated = categorySchema.safeParse({ name: data.name, slug })
    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    // Check for duplicate slug (excluding current category)
    const duplicate = await prisma.category.findFirst({
      where: { slug: validated.data.slug, NOT: { id } }
    })
    if (duplicate) {
      return {
        success: false,
        error: "Slug sudah digunakan",
        fieldErrors: { slug: ["Slug sudah digunakan oleh kategori lain"] }
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: validated.data.name,
        slug: validated.data.slug,
      }
    })

    return { success: true, data: category }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat memperbarui kategori" }
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requirePermission("article:publish")

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } }
    })
    
    if (!existing) {
      return { success: false, error: "Kategori tidak ditemukan" }
    }

    if (existing._count.articles > 0) {
      return { 
        success: false, 
        error: `Kategori tidak dapat dihapus karena masih memiliki ${existing._count.articles} artikel` 
      }
    }

    await prisma.category.delete({ where: { id } })

    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat menghapus kategori" }
  }
}
