import type { SessionWithRole } from "@/types"

// ============================================
// Type Definitions
// ============================================

export type Role = "SUPER_ADMIN" | "EDITOR" | "CONTRIBUTOR"

export type Permission =
  | "menu:manage"
  | "content:manage"
  | "article:create"
  | "article:edit"
  | "article:publish"
  | "article:delete"
  | "gallery:manage"
  | "staff:manage"
  | "user:manage"

// ============================================
// Permission Matrix
// ============================================

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "menu:manage",
    "content:manage",
    "article:create",
    "article:edit",
    "article:publish",
    "article:delete",
    "gallery:manage",
    "staff:manage",
    "user:manage",
  ],
  EDITOR: [
    "content:manage",
    "article:create",
    "article:edit",
    "article:publish",
    "article:delete",
    "gallery:manage",
    "staff:manage",
  ],
  CONTRIBUTOR: ["article:create", "article:edit"],
}

// ============================================
// Permission Checker
// ============================================

/**
 * Check if a role has a specific permission.
 * Pure function — no side effects.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes(permission)
}

// ============================================
// Server Action Guard
// ============================================

/**
 * Server Action guard that checks the current session for a required permission.
 * Throws an error if the user is not authenticated or lacks the permission.
 * Returns the session if authorized.
 *
 * Uses dynamic import for `auth` to avoid pulling next-auth into pure unit tests.
 */
export async function requirePermission(
  permission: Permission
): Promise<SessionWithRole> {
  const { auth } = await import("@/lib/auth")
  const session = (await auth()) as SessionWithRole | null

  if (!session?.user) {
    throw new Error("Anda harus login untuk melakukan aksi ini")
  }

  const role = session.user.role as Role

  if (!hasPermission(role, permission)) {
    throw new Error("Anda tidak memiliki izin untuk melakukan aksi ini")
  }

  return session
}
