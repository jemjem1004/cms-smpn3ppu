import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { hasPermission, type Role } from "@/lib/rbac"
import { getSettingsForAdmin } from "@/actions/settings"
import { SettingsForm } from "@/components/admin/settings-form"

export const metadata = {
  title: "Pengaturan Situs — Admin",
  description: "Kelola pengaturan identitas dan informasi sekolah",
}

export default async function PengaturanPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const user = session.user as { role: Role }
  
  // Only super admin can access settings
  if (!hasPermission(user.role, "menu:manage")) {
    redirect("/403")
  }

  const result = await getSettingsForAdmin()
  
  if (!result.success) {
    return (
      <div className="p-6">
        <p className="text-destructive">Gagal memuat pengaturan: {result.error}</p>
      </div>
    )
  }

  return <SettingsForm initialSettings={result.data} />
}
