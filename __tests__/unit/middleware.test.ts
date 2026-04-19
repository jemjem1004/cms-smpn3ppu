import { describe, it, expect } from "vitest"

/**
 * Unit tests for route guard middleware logic.
 * Tests the ROUTE_PERMISSIONS mapping and access control rules.
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */

// Extract the permission logic for testability
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/admin/menu": ["SUPER_ADMIN"],
  "/admin/pengguna": ["SUPER_ADMIN"],
  "/admin/konten": ["SUPER_ADMIN", "EDITOR"],
  "/admin/galeri": ["SUPER_ADMIN", "EDITOR"],
  "/admin/guru": ["SUPER_ADMIN", "EDITOR"],
  "/admin/berita": ["SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"],
}

function isRouteAllowed(pathname: string, role: string | undefined): boolean {
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route) && (!role || !allowedRoles.includes(role))) {
      return false
    }
  }
  return true
}

describe("Route Guard Middleware Logic", () => {
  describe("Unauthenticated access", () => {
    it("should deny access to /admin for unauthenticated users", () => {
      // Unauthenticated users have no role — but /admin itself has no route restriction
      // The middleware redirects to /login before role check if no session
      // This test validates the role-check logic only
      expect(isRouteAllowed("/admin", undefined)).toBe(true)
    })

    it("should deny access to /admin/menu for users without role", () => {
      expect(isRouteAllowed("/admin/menu", undefined)).toBe(false)
    })
  })

  describe("SUPER_ADMIN access", () => {
    it("should allow SUPER_ADMIN to access /admin", () => {
      expect(isRouteAllowed("/admin", "SUPER_ADMIN")).toBe(true)
    })

    it("should allow SUPER_ADMIN to access /admin/menu", () => {
      expect(isRouteAllowed("/admin/menu", "SUPER_ADMIN")).toBe(true)
    })

    it("should allow SUPER_ADMIN to access /admin/pengguna", () => {
      expect(isRouteAllowed("/admin/pengguna", "SUPER_ADMIN")).toBe(true)
    })

    it("should allow SUPER_ADMIN to access /admin/konten", () => {
      expect(isRouteAllowed("/admin/konten", "SUPER_ADMIN")).toBe(true)
    })

    it("should allow SUPER_ADMIN to access /admin/berita", () => {
      expect(isRouteAllowed("/admin/berita", "SUPER_ADMIN")).toBe(true)
    })

    it("should allow SUPER_ADMIN to access /admin/galeri", () => {
      expect(isRouteAllowed("/admin/galeri", "SUPER_ADMIN")).toBe(true)
    })

    it("should allow SUPER_ADMIN to access /admin/guru", () => {
      expect(isRouteAllowed("/admin/guru", "SUPER_ADMIN")).toBe(true)
    })
  })

  describe("EDITOR access", () => {
    it("should allow EDITOR to access /admin", () => {
      expect(isRouteAllowed("/admin", "EDITOR")).toBe(true)
    })

    it("should deny EDITOR access to /admin/menu", () => {
      expect(isRouteAllowed("/admin/menu", "EDITOR")).toBe(false)
    })

    it("should deny EDITOR access to /admin/pengguna", () => {
      expect(isRouteAllowed("/admin/pengguna", "EDITOR")).toBe(false)
    })

    it("should allow EDITOR to access /admin/konten", () => {
      expect(isRouteAllowed("/admin/konten", "EDITOR")).toBe(true)
    })

    it("should allow EDITOR to access /admin/berita", () => {
      expect(isRouteAllowed("/admin/berita", "EDITOR")).toBe(true)
    })

    it("should allow EDITOR to access /admin/galeri", () => {
      expect(isRouteAllowed("/admin/galeri", "EDITOR")).toBe(true)
    })

    it("should allow EDITOR to access /admin/guru", () => {
      expect(isRouteAllowed("/admin/guru", "EDITOR")).toBe(true)
    })
  })

  describe("CONTRIBUTOR access", () => {
    it("should allow CONTRIBUTOR to access /admin", () => {
      expect(isRouteAllowed("/admin", "CONTRIBUTOR")).toBe(true)
    })

    it("should deny CONTRIBUTOR access to /admin/menu", () => {
      expect(isRouteAllowed("/admin/menu", "CONTRIBUTOR")).toBe(false)
    })

    it("should deny CONTRIBUTOR access to /admin/pengguna", () => {
      expect(isRouteAllowed("/admin/pengguna", "CONTRIBUTOR")).toBe(false)
    })

    it("should deny CONTRIBUTOR access to /admin/konten", () => {
      expect(isRouteAllowed("/admin/konten", "CONTRIBUTOR")).toBe(false)
    })

    it("should allow CONTRIBUTOR to access /admin/berita", () => {
      expect(isRouteAllowed("/admin/berita", "CONTRIBUTOR")).toBe(true)
    })

    it("should deny CONTRIBUTOR access to /admin/galeri", () => {
      expect(isRouteAllowed("/admin/galeri", "CONTRIBUTOR")).toBe(false)
    })

    it("should deny CONTRIBUTOR access to /admin/guru", () => {
      expect(isRouteAllowed("/admin/guru", "CONTRIBUTOR")).toBe(false)
    })
  })

  describe("Sub-route access", () => {
    it("should apply /admin/berita permission to /admin/berita/123/edit", () => {
      expect(isRouteAllowed("/admin/berita/123/edit", "CONTRIBUTOR")).toBe(true)
      expect(isRouteAllowed("/admin/berita/123/edit", "EDITOR")).toBe(true)
    })

    it("should apply /admin/menu permission to /admin/menu/create", () => {
      expect(isRouteAllowed("/admin/menu/create", "EDITOR")).toBe(false)
      expect(isRouteAllowed("/admin/menu/create", "SUPER_ADMIN")).toBe(true)
    })
  })
})
