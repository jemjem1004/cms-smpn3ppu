"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Save, Globe } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArticleEditor } from "@/components/admin/article-editor"
import { ImageUploader } from "@/components/admin/image-uploader"
import { createArticle, updateArticle, publishArticle } from "@/actions/article"

interface Category {
  id: string
  name: string
  slug: string
}

interface ArticleFormProps {
  mode: "create" | "edit"
  articleId?: string
  initialData?: {
    title: string
    content: string
    slug: string
    categoryId: string | null
    thumbnailUrl: string | null
    metaTitle: string | null
    metaDesc: string | null
    status: "DRAFT" | "PUBLISHED"
  }
  categories: Category[]
  canPublish: boolean
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function ArticleForm({
  mode,
  articleId,
  initialData,
  categories,
  canPublish,
}: ArticleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [slug, setSlug] = useState(initialData?.slug ?? "")
  const [slugManual, setSlugManual] = useState(false)
  const [content, setContent] = useState(initialData?.content ?? "")
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "")
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl ?? "")
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? "")
  const [metaDesc, setMetaDesc] = useState(initialData?.metaDesc ?? "")
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManual) {
      setSlug(generateSlug(value))
    }
  }

  function handleSave(publishAfter = false) {
    setErrors({})
    startTransition(async () => {
      let result
      const data = {
        title,
        content,
        slug: slug || undefined,
        categoryId: categoryId || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        metaTitle: metaTitle || undefined,
        metaDesc: metaDesc || undefined,
      }

      if (mode === "create") {
        result = await createArticle(data)
      } else {
        result = await updateArticle(articleId!, data)
      }

      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors)
        }
        toast.error(result.error)
        return
      }

      if (publishAfter && result.success) {
        const pubResult = await publishArticle(result.data.id)
        if (!pubResult.success) {
          toast.error(pubResult.error)
          return
        }
        toast.success("Artikel berhasil dipublikasikan")
      } else {
        toast.success(
          mode === "create" ? "Artikel berhasil dibuat" : "Artikel berhasil diperbarui"
        )
      }

      router.push("/admin/berita")
      router.refresh()
    })
  }

  const isDraft = !initialData || initialData.status === "DRAFT"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/berita">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Buat Artikel Baru" : "Edit Artikel"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {mode === "create" ? "Simpan Draft" : "Simpan"}
          </Button>
          {canPublish && isDraft && (
            <Button onClick={() => handleSave(true)} disabled={isPending}>
              <Globe className="mr-2 h-4 w-4" />
              Publikasikan
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              placeholder="Judul artikel"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="slug-artikel"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugManual(true)
              }}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Konten</Label>
            <ArticleEditor content={content} onChange={setContent} />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content[0]}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gambar Thumbnail</Label>
            <ImageUploader
              onUploadComplete={(url) => setThumbnailUrl(url)}
              currentImageUrl={thumbnailUrl || undefined}
            />
          </div>

          <Separator />

          {/* SEO */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold">SEO</p>
              <p className="text-xs text-muted-foreground mt-0.5">Kosongkan untuk menggunakan judul & konten artikel</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaTitle" className="text-xs">Meta Title</Label>
              <Input
                id="metaTitle"
                placeholder={title || "Judul artikel"}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground text-right">{metaTitle.length}/60</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDesc" className="text-xs">Meta Description</Label>
              <Textarea
                id="metaDesc"
                placeholder="Deskripsi singkat untuk mesin pencari..."
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground text-right">{metaDesc.length}/160</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
