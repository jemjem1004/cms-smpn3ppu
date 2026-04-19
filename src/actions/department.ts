"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac"
import { z } from "zod"
import type { ActionResult } from "@/types"
import type { Department } from "@prisma/client"

const departmentSchema = z.object({
  name: z.string().min(1, "Nama jurusan wajib diisi").max(200),
  slug: z.string().min(1, "Slug wajib diisi").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  headName: z.string().optional(),
  headPhoto: z.string().optional(),
  headTitle: z.string().optional(),
  kompetensi: z.array(z.string()).optional().default([]),
  bidangKerja: z.array(z.string()).optional().default([]),
  order: z.number().int().optional(),
})

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

export async function getDepartments(): Promise<ActionResult<Department[]>> {
  try {
    await requirePermission("content:manage")
    const items = await prisma.department.findMany({ orderBy: { order: "asc" } })
    return { success: true, data: items }
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message }
    return { success: false, error: "Terjadi kesalahan" }
  }
}

export async function getPublicDepartments(): Promise<Department[]> {
  return prisma.department.findMany({ orderBy: { order: "asc" } })
}

export async function getDepartmentBySlug(slug: string): Promise<Department | null> {
  return prisma.department.findUnique({ where: { slug } })
}

export async function createDepartment(data: {
  name: string; slug?: string; description?: string; imageUrl?: string
  headName?: string; headPhoto?: string; headTitle?: string
  kompetensi?: string[]; bidangKerja?: string[]
}): Promise<ActionResult<Department>> {
  try {
    await requirePermission("content:manage")
    const slug = data.slug || generateSlug(data.name)
    const validated = departmentSchema.safeParse({ ...data, slug })
    if (!validated.success) {
      return { success: false, error: "Validasi gagal", fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]> }
    }
    const maxOrder = await prisma.department.aggregate({ _max: { order: true } })
    const item = await prisma.department.create({
      data: { ...validated.data, order: (maxOrder._max.order ?? -1) + 1 },
    })
    revalidatePath("/admin/konten")
    revalidatePath("/jurusan")
    return { success: true, data: item }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) return { success: false, error: "Slug sudah digunakan" }
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan" }
  }
}

export async function updateDepartment(id: string, data: {
  name: string; slug?: string; description?: string; imageUrl?: string
  headName?: string; headPhoto?: string; headTitle?: string
  kompetensi?: string[]; bidangKerja?: string[]; order?: number
}): Promise<ActionResult<Department>> {
  try {
    await requirePermission("content:manage")
    const slug = data.slug || generateSlug(data.name)
    const validated = departmentSchema.safeParse({ ...data, slug })
    if (!validated.success) {
      return { success: false, error: "Validasi gagal", fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]> }
    }
    const item = await prisma.department.update({ where: { id }, data: validated.data })
    revalidatePath("/admin/konten")
    revalidatePath("/jurusan")
    revalidatePath(`/jurusan/${item.slug}`)
    return { success: true, data: item }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) return { success: false, error: "Slug sudah digunakan" }
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan" }
  }
}

export async function deleteDepartment(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission("content:manage")
    await prisma.department.delete({ where: { id } })
    revalidatePath("/admin/konten")
    revalidatePath("/jurusan")
    return { success: true, data: null }
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message }
    return { success: false, error: "Terjadi kesalahan" }
  }
}
