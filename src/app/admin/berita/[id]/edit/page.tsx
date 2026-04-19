import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { hasPermission, type Role } from "@/lib/rbac"
import { getArticleById } from "@/actions/article"
import { getCategories } from "@/actions/category"
import { ArticleForm } from "@/components/admin/article-form"
import type { SessionWithRole } from "@/types"

export const metadata = {
  title: "Edit Artikel — Admin",
  description: "Edit artikel berita",
}

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params
  const session = (await auth()) as SessionWithRole | null
  const role = (session?.user?.role ?? "CONTRIBUTOR") as Role

  const [articleResult, categoriesResult] = await Promise.all([
    getArticleById(id),
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
        metaTitle: article.metaTitle ?? null,
        metaDesc: article.metaDesc ?? null,
        status: article.status,
      }}
      categories={categories}
      canPublish={hasPermission(role, "article:publish")}
    />
  )
}
