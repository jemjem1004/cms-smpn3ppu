import { getDepartments } from "@/actions/department"
import { DepartmentManager } from "@/components/admin/department-manager"

export const metadata = {
  title: "Jurusan — Admin",
}

export default async function JurusanAdminPage() {
  const result = await getDepartments()
  const departments = result.success ? result.data : []

  return <DepartmentManager initialItems={departments} />
}
