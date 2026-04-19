import { prisma } from "@/lib/prisma"
import type { MenuItemWithChildren } from "@/types"

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
