import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { hasPermission, type Role } from "@/lib/rbac"
import { getArticleById, getCategories } from "@/actions/article"
import { ArticleForm } from "@/components/admin/article-form"
import type { SessionWithRole } from "@/types"

export const metadata = {
  title: "Edit Artikel — Admin SMKN 1 Surabaya",
  description: "Edit artikel berita",
}

interface EditPageProps {
  params: { id: string }
}

export default async function EditPage({ params }: EditPageProps) {
  const session = (await auth()) as SessionWithRole | null
  const role = (session?.user?.role ?? "CONTRIBUTOR") as Role

  const [articleResult, categoriesResult] = await Promise.all([
    getArticleById(params.id),
    getCategories(),
  ])

  if (!articleResult.success || !articleResult.data) {
    notFound()
  }

  const article = articleResult.data as any
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <ArticleForm
      mode="edit"
      articleId={article.id}
      initialData={{
        title: article.title,
        content: article.content,
        slug: article.slug,
        categoryId: article.categoryId,
        thumbnailUrl: article.thumbnailUrl,
        status: article.status,
      }}
      categories={categories}
      canPublish={hasPermission(role, "article:publish")}
    />
  )
}
