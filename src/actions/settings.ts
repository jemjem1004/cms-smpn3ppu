"use server"

import { revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac"
import { z } from "zod"
import type { ActionResult, SiteIdentity, SiteContact, SiteSocial, SiteSettings } from "@/types"

// ============================================
// Validation Schemas
// ============================================

const identitySchema = z.object({
  name: z.string().min(1, "Nama sekolah wajib diisi").max(200),
  shortName: z.string().min(1, "Nama singkat wajib diisi").max(50),
  tagline: z.string().max(100).optional().default(""),
  description: z.string().max(1000).optional().default(""),
  logoUrl: z.string().url("URL logo tidak valid").or(z.literal("")).optional().default(""),
})

const contactSchema = z.object({
  address: z.string().max(500).optional().default(""),
  phone: z.string().max(50).optional().default(""),
  email: z.string().email("Email tidak valid").or(z.literal("")).optional().default(""),
})

const socialSchema = z.object({
  facebook: z.string().url("URL tidak valid").or(z.literal("")).optional().default(""),
  instagram: z.string().url("URL tidak valid").or(z.literal("")).optional().default(""),
  youtube: z.string().url("URL tidak valid").or(z.literal("")).optional().default(""),
  tiktok: z.string().url("URL tidak valid").or(z.literal("")).optional().default(""),
})

// ============================================
// Default Values
// ============================================

const DEFAULT_IDENTITY: SiteIdentity = {
  name: "SMKN 1 Surabaya",
  shortName: "SMKN 1",
  tagline: "Surabaya",
  description: "SMK Negeri 1 Surabaya adalah sekolah menengah kejuruan unggulan yang berkomitmen mencetak lulusan berkompeten dan siap kerja.",
  logoUrl: "",
}

const DEFAULT_CONTACT: SiteContact = {
  address: "Jl. SMKN 1 Surabaya, Kota Surabaya, Jawa Timur",
  phone: "(031) 1234567",
  email: "info@smkn1surabaya.sch.id",
}

const DEFAULT_SOCIAL: SiteSocial = {
  facebook: "",
  instagram: "",
  youtube: "",
  tiktok: "",
}


// ============================================
// Get Settings
// ============================================

/**
 * Get all site settings for admin form (bypasses cache)
 */
export async function getSettingsForAdmin(): Promise<ActionResult<SiteSettings>> {
  try {
    await requirePermission("menu:manage") // Only super admin

    const records = await prisma.siteSettings.findMany({
      where: {
        key: { in: ["site.identity", "site.contact", "site.social"] }
      }
    })

    const settingsMap = new Map<string, unknown>()
    for (const record of records) {
      settingsMap.set(record.key, record.value)
    }

    return {
      success: true,
      data: {
        identity: (settingsMap.get("site.identity") as SiteIdentity) ?? DEFAULT_IDENTITY,
        contact: (settingsMap.get("site.contact") as SiteContact) ?? DEFAULT_CONTACT,
        social: (settingsMap.get("site.social") as SiteSocial) ?? DEFAULT_SOCIAL,
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat mengambil pengaturan" }
  }
}

// ============================================
// Update Identity
// ============================================

export async function updateIdentity(data: SiteIdentity): Promise<ActionResult<SiteIdentity>> {
  try {
    await requirePermission("menu:manage")

    const validated = identitySchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    await prisma.siteSettings.upsert({
      where: { key: "site.identity" },
      update: { value: validated.data as any },
      create: { key: "site.identity", value: validated.data as any },
    })

    revalidateTag("site-settings")

    return { success: true, data: validated.data as SiteIdentity }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat menyimpan identitas" }
  }
}

// ============================================
// Update Contact
// ============================================

export async function updateContact(data: SiteContact): Promise<ActionResult<SiteContact>> {
  try {
    await requirePermission("menu:manage")

    const validated = contactSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    await prisma.siteSettings.upsert({
      where: { key: "site.contact" },
      update: { value: validated.data as any },
      create: { key: "site.contact", value: validated.data as any },
    })

    revalidateTag("site-settings")

    return { success: true, data: validated.data as SiteContact }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat menyimpan kontak" }
  }
}

// ============================================
// Update Social
// ============================================

export async function updateSocial(data: SiteSocial): Promise<ActionResult<SiteSocial>> {
  try {
    await requirePermission("menu:manage")

    const validated = socialSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    await prisma.siteSettings.upsert({
      where: { key: "site.social" },
      update: { value: validated.data as any },
      create: { key: "site.social", value: validated.data as any },
    })

    revalidateTag("site-settings")

    return { success: true, data: validated.data as SiteSocial }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Terjadi kesalahan saat menyimpan media sosial" }
  }
}
