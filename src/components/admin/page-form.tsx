"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Save, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArticleEditor } from "@/components/admin/article-editor"
import { createPage, updatePage } from "@/actions/page"

interface PageFormProps {
  mode: "create" | "edit"
  pageId?: string
  initialData?: {
    title: string
    slug: string
    content: string
    isPublished: boolean
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function PageForm({ mode, pageId, initialData }: PageFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [slug, setSlug] = useState(initialData?.slug ?? "")
  const [slugManual, setSlugManual] = useState(false)
  const [content, setContent] = useState(initialData?.content ?? "")
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManual) setSlug(generateSlug(value))
  }

  function handleSave(publish = false) {
    setErrors({})
    startTransition(async () => {
      const data = { title, slug: slug || undefined, content, isPublished: publish }

      let result
      if (mode === "create") {
        result = await createPage(data)
      } else {
        result = await updatePage(pageId!, data)
      }

      if (!result.success) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        toast.error(result.error)
        return
      }

      toast.success(
        mode === "create"
          ? publish ? "Halaman berhasil dibuat dan dipublikasikan" : "Halaman berhasil dibuat sebagai draft"
          : "Halaman berhasil diperbarui"
      )
      router.push("/admin/halaman")
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/halaman">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Buat Halaman Baru" : "Edit Halaman"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Setelah disimpan, tautkan halaman ini ke menu di{" "}
            <Link href="/admin/menu" className="underline">Menu Builder</Link>{" "}
            dengan URL: <code className="bg-muted px-1 rounded">/halaman/{slug || "slug-halaman"}</code>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {mode === "create" ? "Simpan Draft" : "Simpan"}
          </Button>
          {(mode === "create" || !initialData?.isPublished) && (
            <Button onClick={() => handleSave(true)} disabled={isPending}>
              <Globe className="mr-2 h-4 w-4" />
              Publikasikan
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Halaman</Label>
            <Input
              id="title"
              placeholder="Contoh: Visi & Misi, Profil Sekolah, Jurusan"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label>Konten Halaman</Label>
            <ArticleEditor content={content} onChange={setContent} />
            {errors.content && <p className="text-sm text-destructive">{errors.content[0]}</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Pengaturan URL</h3>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="visi-misi"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugManual(true)
                }}
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug[0]}</p>}
              <p className="text-xs text-muted-foreground">
                URL publik: <code>/halaman/{slug || "..."}</code>
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-semibold text-sm">Cara Menautkan ke Menu</h3>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Simpan halaman ini</li>
              <li>Buka Menu Builder</li>
              <li>Tambah item menu baru</li>
              <li>Isi URL: <code className="bg-muted px-1 rounded">/halaman/{slug || "slug"}</code></li>
              <li>Pilih tipe: Internal</li>
              <li>Simpan menu</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
