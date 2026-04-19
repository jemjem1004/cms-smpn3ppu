import { notFound } from "next/navigation"
import { getPageById } from "@/actions/page"
import { PageForm } from "@/components/admin/page-form"

export const metadata = {
  title: "Edit Halaman — Admin SMKN 1 Surabaya",
}

export default async function EditPage({ params }: { params: { id: string } }) {
  const result = await getPageById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const page = result.data

  return (
    <PageForm
      mode="edit"
      pageId={page.id}
      initialData={{
        title: page.title,
        slug: page.slug,
        content: page.content,
        isPublished: page.isPublished,
      }}
    />
  )
}
