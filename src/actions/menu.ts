"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac"
import { menuItemSchema } from "@/lib/validators"
import type { ActionResult, MenuItemForm, MenuItemWithChildren } from "@/types"

export async function getPublicMenuItems(): Promise<MenuItemWithChildren[]> {
  const items = await prisma.menuItem.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  })

  return items.map((item) => ({
    id: item.id,
    label: item.label,
    url: item.url,
    type: item.type,
    parentId: item.parentId,
    order: item.order,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    children: item.children.map((child) => ({
      id: child.id,
      label: child.label,
      url: child.url,
      type: child.type,
      parentId: child.parentId,
      order: child.order,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt,
      children: [],
    })),
  }))
}

export async function getMenuItems(): Promise<ActionResult<MenuItemWithChildren[]>> {
  try {
    await requirePermission("menu:manage")

    const items = await prisma.menuItem.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    })

    const tree: MenuItemWithChildren[] = items.map((item) => ({
      id: item.id,
      label: item.label,
      url: item.url,
      type: item.type,
      parentId: item.parentId,
      order: item.order,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      children: item.children.map((child) => ({
        id: child.id,
        label: child.label,
        url: child.url,
        type: child.type,
        parentId: child.parentId,
        order: child.order,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        children: [],
      })),
    }))

    return { success: true, data: tree }
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message }
    return { success: false, error: "Terjadi kesalahan saat mengambil data menu" }
  }
}

/**
 * Save menu items — full replace strategy.
 *
 * The client sends a flat array where:
 * - parents have parentId === null
 * - children have parentId = the parent's LOCAL state ID (could be temp-xxx or real DB id)
 *
 * Strategy: match children to parents by position.
 * The i-th unique parentId in children corresponds to the i-th parent in the parents array.
 */
export async function saveMenuItems(
  items: MenuItemForm[]
): Promise<ActionResult<MenuItemWithChildren[]>> {
  try {
    await requirePermission("menu:manage")

    // Validate
    for (const item of items) {
      const result = menuItemSchema.safeParse(item)
      if (!result.success) {
        return {
          success: false,
          error: "Validasi gagal",
          fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
        }
      }
    }

    const parents = items.filter((i) => i.parentId === null)
    const children = items.filter((i) => i.parentId !== null)

    // Collect unique old parentId references from children, in order of first appearance
    const uniqueOldParentIds: string[] = []
    for (const child of children) {
      if (!uniqueOldParentIds.includes(child.parentId!)) {
        uniqueOldParentIds.push(child.parentId!)
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.menuItem.deleteMany({})

      // Create parents and build old→new ID mapping by position
      // uniqueOldParentIds[i] maps to parents[i]
      const oldToNewId = new Map<string, string>()

      for (let i = 0; i < parents.length; i++) {
        const parent = parents[i]
        const created = await tx.menuItem.create({
          data: {
            label: parent.label,
            url: parent.url,
            type: parent.type,
            order: parent.order,
            parentId: null,
          },
        })
        // Map the old local ID (at position i) to the new DB id
        if (uniqueOldParentIds[i]) {
          oldToNewId.set(uniqueOldParentIds[i], created.id)
        }
      }

      // Create children with resolved parent IDs
      for (const child of children) {
        const newParentId = oldToNewId.get(child.parentId!)
        if (!newParentId) {
          throw new Error(`Gagal memetakan parent untuk item "${child.label}"`)
        }
        await tx.menuItem.create({
          data: {
            label: child.label,
            url: child.url,
            type: child.type,
            order: child.order,
            parentId: newParentId,
          },
        })
      }

      const created = await tx.menuItem.findMany({
        where: { parentId: null },
        include: { children: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      })

      return {
        success: true as const,
        data: created.map((item) => ({
          id: item.id,
          label: item.label,
          url: item.url,
          type: item.type,
          parentId: item.parentId,
          order: item.order,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          children: item.children.map((c) => ({
            id: c.id,
            label: c.label,
            url: c.url,
            type: c.type,
            parentId: c.parentId,
            order: c.order,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            children: [] as MenuItemWithChildren[],
          })),
        })) as MenuItemWithChildren[],
      }
    })

    if (!result.success) return result

    revalidatePath("/admin/menu")
    revalidatePath("/")

    return { success: true, data: result.data }
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message }
    return { success: false, error: "Terjadi kesalahan saat menyimpan menu" }
  }
}

export async function deleteMenuItem(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission("menu:manage")
    await prisma.menuItem.delete({ where: { id } })
    revalidatePath("/admin/menu")
    revalidatePath("/")
    return { success: true, data: null }
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message }
    return { success: false, error: "Terjadi kesalahan saat menghapus menu item" }
  }
}
