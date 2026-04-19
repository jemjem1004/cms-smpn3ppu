"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac"
import { articleSchema } from "@/lib/validators"
import type { ActionResult, ArticleFilter, PaginatedResult } from "@/types"
import type { Article } from "@prisma/client"

// ============================================
// Helpers
// ============================================

/**
 * Generate a URL-friendly slug from a title.
 * Lowercases, replaces spaces/special chars with hyphens,
 * removes non-alphanumeric chars, and appends a random suffix.
 */
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  const suffix = Math.random().toString(36).substring(2, 8)
  return `${base}-${suffix}`
}

// ============================================
// Article CRUD
// ============================================

/**
 * Get paginated list of articles with optional search, category, and status filters.
 * Soft-deleted articles are excluded by default.
 */
export async function getArticles(
  params: ArticleFilter = {}
): Promise<ActionResult<PaginatedResult<Article>>> {
  try {
    await requirePermission("article:create")

    const { search, categoryId, status, page = 1, pageSize = 10 } = params

    // Build where clause — always exclude soft-deleted
    const where: Record<string, unknown> = { isDeleted: false }

    if (status) {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.title = { contains: search, mode: "insensitive" }
    }

    const [data, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { author: { select: { id: true, name: true } }, category: true },
      }),
      prisma.article.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: data as Article[],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat mengambil artikel" }
  }
}

/**
 * Get a single article by ID.
 */
export async function getArticleById(
  id: string
): Promise<ActionResult<Article | null>> {
  try {
    await requirePermission("article:create")

    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } }, category: true },
    })

    return { success: true, data: article as Article | null }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat mengambil artikel" }
  }
}

/**
 * Create a new article.
 * Auto-generates slug from title if not provided.
 * Forces status to DRAFT for Contributors.
 */
export async function createArticle(
  data: {
    title: string
    content: string
    slug?: string
    categoryId?: string
    thumbnailUrl?: string
    status?: "DRAFT" | "PUBLISHED"
  }
): Promise<ActionResult<Article>> {
  try {
    const session = await requirePermission("article:create")

    // Auto-generate slug if not provided
    const slug = data.slug || generateSlug(data.title)

    // Validate with articleSchema
    const validated = articleSchema.safeParse({
      title: data.title,
      content: data.content,
      slug,
      categoryId: data.categoryId,
      thumbnailUrl: data.thumbnailUrl,
    })

    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    // Force DRAFT for Contributors
    const role = session.user.role
    const articleStatus = role === "CONTRIBUTOR" ? "DRAFT" : (data.status ?? "DRAFT")

    const article = await prisma.article.create({
      data: {
        title: validated.data.title,
        content: validated.data.content,
        slug: validated.data.slug,
        thumbnailUrl: validated.data.thumbnailUrl ?? null,
        status: articleStatus,
        authorId: session.user.id,
        categoryId: validated.data.categoryId ?? null,
        publishedAt: articleStatus === "PUBLISHED" ? new Date() : null,
      },
    })

    revalidatePath("/admin/berita")
    revalidatePath("/")

    return { success: true, data: article }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return { success: false, error: "Slug artikel sudah digunakan" }
      }
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat membuat artikel" }
  }
}

/**
 * Update an existing article.
 */
export async function updateArticle(
  id: string,
  data: {
    title: string
    content: string
    slug?: string
    categoryId?: string
    thumbnailUrl?: string
  }
): Promise<ActionResult<Article>> {
  try {
    await requirePermission("article:edit")

    // Auto-generate slug if not provided
    const slug = data.slug || generateSlug(data.title)

    const validated = articleSchema.safeParse({
      title: data.title,
      content: data.content,
      slug,
      categoryId: data.categoryId,
      thumbnailUrl: data.thumbnailUrl,
    })

    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: validated.data.title,
        content: validated.data.content,
        slug: validated.data.slug,
        thumbnailUrl: validated.data.thumbnailUrl ?? null,
        categoryId: validated.data.categoryId ?? null,
      },
    })

    revalidatePath("/admin/berita")
    revalidatePath("/")

    return { success: true, data: article }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return { success: false, error: "Slug artikel sudah digunakan" }
      }
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat memperbarui artikel" }
  }
}

/**
 * Publish an article. Only Editor and Super Admin can publish.
 * Sets status to PUBLISHED and records publishedAt timestamp.
 */
export async function publishArticle(
  id: string
): Promise<ActionResult<Article>> {
  try {
    await requirePermission("article:publish")

    const article = await prisma.article.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    })

    revalidatePath("/admin/berita")
    revalidatePath("/")

    return { success: true, data: article }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat mempublikasikan artikel" }
  }
}

/**
 * Soft-delete an article by setting isDeleted to true.
 */
export async function softDeleteArticle(
  id: string
): Promise<ActionResult<Article>> {
  try {
    await requirePermission("article:delete")

    const article = await prisma.article.update({
      where: { id },
      data: { isDeleted: true },
    })

    revalidatePath("/admin/berita")
    revalidatePath("/")

    return { success: true, data: article }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat menghapus artikel" }
  }
}

// ============================================
// Category Helper
// ============================================

/**
 * Fetch all categories for filter dropdowns.
 */
export async function getCategories(): Promise<ActionResult<{ id: string; name: string; slug: string }[]>> {
  try {
    await requirePermission("article:create")

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    })

    return { success: true, data: categories }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat mengambil kategori" }
  }
}
