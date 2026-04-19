import { getMenuItems } from "@/actions/menu"
import { getPagesForMenu } from "@/actions/page"
import { getPublicDepartments } from "@/actions/department"
import { MenuBuilder } from "@/components/admin/menu-builder"

export const metadata = {
  title: "Menu Builder — Admin",
  description: "Kelola navigasi website",
}

export default async function MenuPage() {
  const [menuResult, pages, departments] = await Promise.all([
    getMenuItems(),
    getPagesForMenu(),
    getPublicDepartments(),
  ])

  const items = menuResult.success ? menuResult.data : []

  return <MenuBuilder items={items} pages={pages} departments={departments} />
}
