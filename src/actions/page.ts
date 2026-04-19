"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac"
import { z } from "zod"
import type { ActionResult } from "@/types"
import type { Page } from "@prisma/client"

const pageSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(200),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  content: z.string().min(1, "Konten wajib diisi"),
  isPublished: z.boolean().default(false),
})

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function getPages(): Promise<ActionResult<Page[]>> {
  try {
    await requirePermission("page:manage")
    const pages = await prisma.page.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })
    return { success: true, data: pages }
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message }
    return { success: false, error: "Terjadi kesalahan saat mengambil halaman" }
  }
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return prisma.page.findUnique({ where: { slug, isPublished: true } })
}

export async function getPagesForMenu(): Promise<{ title: string; slug: string }[]> {
  const pages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { title: true, slug: true },
    orderBy: [{ order: "asc" }, { title: "asc" }],
  })
  return pages
}

export async function getPageById(id: string): Promise<ActionResult<Page | null>> {
  try {
    await requirePermission("page:manage")
    const page = await prisma.page.findUnique({ where: { id } })
    return { success: true, data: page }
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message }
    return { success: false, error: "Terjadi kesalahan" }
  }
}

export async function createPage(data: {
  title: string
  slug?: string
  content: string
  isPublished?: boolean
  metaTitle?: string
  metaDesc?: string
}): Promise<ActionResult<Page>> {
  try {
    await requirePermission("page:manage")

    const slug = data.slug || generateSlug(data.title)
    const validated = pageSchema.safeParse({ ...data, slug })

    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const maxOrder = await prisma.page.aggregate({ _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? -1) + 1

    const page = await prisma.page.create({
      data: {
        title: validated.data.title,
        slug: validated.data.slug,
        content: validated.data.content,
        isPublished: validated.data.isPublished ?? false,
        metaTitle: data.metaTitle || null,
        metaDesc: data.metaDesc || null,
        order: nextOrder,
      },
    })

    revalidatePath("/admin/halaman")
    return { success: true, data: page }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return { success: false, error: "Slug sudah digunakan, gunakan slug lain" }
      }
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat membuat halaman" }
  }
}

export async function updatePage(
  id: string,
  data: { title: string; slug?: string; content: string; isPublished?: boolean; metaTitle?: string; metaDesc?: string }
): Promise<ActionResult<Page>> {
  try {
    await requirePermission("page:manage")

    const slug = data.slug || generateSlug(data.title)
    const validated = pageSchema.safeParse({ ...data, slug })

    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        title: validated.data.title,
        slug: validated.data.slug,
        content: validated.data.content,
        isPublished: validated.data.isPublished ?? false,
        metaTitle: data.metaTitle || null,
        metaDesc: data.metaDesc || null,
      },
    })

    revalidatePath("/admin/halaman")
    revalidatePath(`/halaman/${page.slug}`)
    return { success: true, data: page }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return { success: false, error: "Slug sudah digunakan, gunakan slug lain" }
      }
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat memperbarui halaman" }
  }
}

export async function deletePage(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission("page:manage")
    await prisma.page.delete({ where: { id } })
    revalidatePath("/admin/halaman")
    return { success: true, data: null }
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message }
    return { success: false, error: "Terjadi kesalahan saat menghapus halaman" }
  }
}

export async function togglePublishPage(id: string, isPublished: boolean): Promise<ActionResult<Page>> {
  try {
    await requirePermission("page:manage")
    const page = await prisma.page.update({
      where: { id },
      data: { isPublished },
    })
    revalidatePath("/admin/halaman")
    revalidatePath(`/halaman/${page.slug}`)
    return { success: true, data: page }
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message }
    return { success: false, error: "Terjadi kesalahan" }
  }
}
