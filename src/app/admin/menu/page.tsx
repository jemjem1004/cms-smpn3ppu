import { getMenuItems } from "@/actions/menu"
import { MenuBuilder } from "@/components/admin/menu-builder"

export const metadata = {
  title: "Menu Builder — Admin SMKN 1 Surabaya",
  description: "Kelola navigasi website",
}

export default async function MenuPage() {
  const result = await getMenuItems()

  const items = result.success ? result.data : []

  return <MenuBuilder items={items} />
}
