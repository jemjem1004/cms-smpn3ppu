"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac"
import { menuItemSchema } from "@/lib/validators"
import type { ActionResult, MenuItemForm, MenuItemWithChildren } from "@/types"

/**
 * Fetch all menu items for the public landing page (no auth required).
 * Returns a tree structure of parents with children, ordered by `order`.
 */
export async function getPublicMenuItems(): Promise<MenuItemWithChildren[]> {
  const items = await prisma.menuItem.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { order: "asc" },
      },
    },
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

/**
 * Fetch all menu items and return as a tree structure (parents with children).
 */
export async function getMenuItems(): Promise<ActionResult<MenuItemWithChildren[]>> {
  try {
    await requirePermission("menu:manage")

    const items = await prisma.menuItem.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { order: "asc" },
        },
      },
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
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat mengambil data menu" }
  }
}

/**
 * Save menu items using a full-replace strategy inside a transaction.
 *
 * Accepts a flat array of MenuItemForm items. Items with parentId === null
 * are top-level (level 1). Items with a non-null parentId are children (level 2).
 *
 * Validation:
 * - Each item is validated against menuItemSchema (Zod)
 * - Hierarchy depth must be ≤ 2 levels — any child whose parentId references
 *   another child (instead of a top-level parent) is rejected
 *
 * Strategy:
 * 1. Validate all items with Zod
 * 2. Enforce depth ≤ 2: children may only reference top-level parents
 * 3. Delete all existing items and recreate in a transaction
 * 4. Create parents first, then create children with resolved parentIds
 */
export async function saveMenuItems(
  items: MenuItemForm[]
): Promise<ActionResult<MenuItemWithChildren[]>> {
  try {
    await requirePermission("menu:manage")

    // Validate each item with Zod
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

    // Separate parents (top-level) and children
    const parents = items.filter((i) => i.parentId === null)
    const children = items.filter((i) => i.parentId !== null)

    // Depth validation: collect all parentId references from children.
    // Each child's parentId must point to a known parent identifier.
    // We build a set of valid parent references — these are the parentIds
    // that exist in the current DB (for existing items) or are identifiable
    // as top-level items. Since children reference existing DB IDs as parentId,
    // we verify that none of those IDs belong to a child item (which would
    // create depth > 2).
    const childParentIds = Array.from(new Set(children.map((c) => c.parentId!)))

    // Check: if any child references another child's parentId as its own
    // parentId, that would mean nesting > 2 levels. We detect this by
    // checking if any child's parentId appears as a parentId of another
    // child AND that parentId is itself a child (not a top-level item).
    // Since we don't have IDs for new items yet, we rely on the DB check
    // inside the transaction.

    const result = await prisma.$transaction(async (tx) => {
      // Before deleting, verify that all child parentIds reference
      // existing top-level items (not children). This enforces depth ≤ 2.
      if (childParentIds.length > 0) {
        const referencedItems = await tx.menuItem.findMany({
          where: { id: { in: childParentIds } },
          select: { id: true, parentId: true },
        })

        for (const ref of referencedItems) {
          if (ref.parentId !== null) {
            return {
              success: false as const,
              error: "Hierarki menu melebihi 2 level. Sub-menu tidak boleh memiliki sub-menu lagi.",
            }
          }
        }

        // Also check that all referenced parentIds actually exist
        const foundIds = referencedItems.map((r) => r.id)
        for (const pid of childParentIds) {
          if (!foundIds.includes(pid)) {
            return {
              success: false as const,
              error: `Referensi parent menu "${pid}" tidak ditemukan`,
            }
          }
        }
      }

      // Delete all existing menu items
      await tx.menuItem.deleteMany({})

      // Create top-level items and build old-ID → new-ID mapping
      const parentIdMap = new Map<string, string>()

      // We need to map the old parent IDs (that children reference) to
      // the newly created parent IDs. We do this by creating parents in
      // order and tracking which old IDs they replace.
      // The client sends children with parentId pointing to existing DB IDs.
      // We create parents in the same order and map old IDs to new IDs.
      const existingParentIds = [...childParentIds]

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

        // Map: if this parent position corresponds to a referenced parentId,
        // map old → new. We use a simple approach: the i-th parent in the
        // input maps to the i-th created parent.
        parentIdMap.set(created.id, created.id)
      }

      // Build positional mapping from old parent IDs to new parent IDs
      // We fetch the order of old parents to match them with new ones
      const createdParents = await tx.menuItem.findMany({
        where: { parentId: null },
        orderBy: { order: "asc" },
        select: { id: true },
      })

      // Map old referenced parentIds to new parent IDs by matching order
      // The parents array and createdParents should be in the same order
      const oldParentIdArray = parents.map((_, idx) => {
        // Find which old parentId this parent position corresponds to
        // This is a heuristic — we match by position
        return existingParentIds[idx] || null
      })

      for (let i = 0; i < createdParents.length; i++) {
        if (oldParentIdArray[i]) {
          parentIdMap.set(oldParentIdArray[i]!, createdParents[i].id)
        }
      }

      // Create children with resolved parent IDs
      for (const child of children) {
        const newParentId = parentIdMap.get(child.parentId!)
        if (!newParentId) {
          throw new Error(
            `Referensi parent "${child.parentId}" tidak valid untuk item "${child.label}"`
          )
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

      // Fetch and return the created tree
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

    if (!result.success) {
      return result
    }

    revalidatePath("/admin/menu")
    revalidatePath("/")

    return { success: true, data: result.data }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat menyimpan menu" }
  }
}

/**
 * Delete a single menu item by ID.
 * Cascade delete handles children automatically (via Prisma onDelete: Cascade).
 */
export async function deleteMenuItem(
  id: string
): Promise<ActionResult<null>> {
  try {
    await requirePermission("menu:manage")

    await prisma.menuItem.delete({
      where: { id },
    })

    revalidatePath("/admin/menu")
    revalidatePath("/")

    return { success: true, data: null }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat menghapus menu item" }
  }
}
