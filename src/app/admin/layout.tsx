import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Toaster } from "@/components/ui/sonner"
import type { SessionWithRole } from "@/types"

export const metadata = {
  title: "Admin — SMKN 1 Surabaya",
  description: "Dashboard Admin CMS SMKN 1 Surabaya",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = (await auth()) as SessionWithRole | null

  if (!session?.user) {
    redirect("/login")
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar user={user} />
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
      <Toaster />
    </div>
  )
}
