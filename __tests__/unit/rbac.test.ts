import { describe, it, expect } from "vitest"
import {
  hasPermission,
  ROLE_PERMISSIONS,
  type Role,
  type Permission,
} from "@/lib/rbac"

const ALL_ROLES: Role[] = ["SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"]

const ALL_PERMISSIONS: Permission[] = [
  "menu:manage",
  "content:manage",
  "article:create",
  "article:edit",
  "article:publish",
  "article:delete",
  "gallery:manage",
  "staff:manage",
  "user:manage",
  "page:manage",
]

describe("hasPermission", () => {
  it("SUPER_ADMIN should have all permissions", () => {
    for (const perm of ALL_PERMISSIONS) {
      expect(hasPermission("SUPER_ADMIN", perm)).toBe(true)
    }
  })

  it("EDITOR should have content, article, gallery, and staff permissions", () => {
    const expected: Permission[] = [
      "content:manage",
      "article:create",
      "article:edit",
      "article:publish",
      "article:delete",
      "gallery:manage",
      "staff:manage",
    ]
    for (const perm of expected) {
      expect(hasPermission("EDITOR", perm)).toBe(true)
    }
  })

  it("EDITOR should NOT have menu:manage or user:manage", () => {
    expect(hasPermission("EDITOR", "menu:manage")).toBe(false)
    expect(hasPermission("EDITOR", "user:manage")).toBe(false)
  })
  it("CONTRIBUTOR should only have article:create and article:edit", () => {
    expect(hasPermission("CONTRIBUTOR", "article:create")).toBe(true)
    expect(hasPermission("CONTRIBUTOR", "article:edit")).toBe(true)
  })

  it("CONTRIBUTOR should NOT have any other permissions", () => {
    const denied: Permission[] = [
      "menu:manage",
      "content:manage",
      "article:publish",
      "article:delete",
      "gallery:manage",
      "staff:manage",
      "user:manage",
      "page:manage",
    ]
    for (const perm of denied) {
      expect(hasPermission("CONTRIBUTOR", perm)).toBe(false)
    }
  })

  it("should return false for an unknown role", () => {
    expect(hasPermission("UNKNOWN" as Role, "menu:manage")).toBe(false)
  })
})

describe("ROLE_PERMISSIONS matrix", () => {
  it("should define permissions for all three roles", () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined()
      expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true)
    }
  })

  it("SUPER_ADMIN permissions should be a superset of EDITOR permissions", () => {
    for (const perm of ROLE_PERMISSIONS.EDITOR) {
      expect(ROLE_PERMISSIONS.SUPER_ADMIN).toContain(perm)
    }
  })

  it("EDITOR permissions should be a superset of CONTRIBUTOR permissions", () => {
    for (const perm of ROLE_PERMISSIONS.CONTRIBUTOR) {
      expect(ROLE_PERMISSIONS.EDITOR).toContain(perm)
    }
  })
})
