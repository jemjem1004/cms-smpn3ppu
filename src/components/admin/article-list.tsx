"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Search, Plus, Pencil, Globe, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { DataTable, type Column } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { publishArticle, softDeleteArticle } from "@/actions/article"

interface ArticleRow {
  id: string
  title: string
  slug: string
  status: "DRAFT" | "PUBLISHED"
  createdAt: string
  publishedAt: string | null
  author: { id: string; name: string } | null
  category: { id: string; name: string; slug: string } | null
}

interface ArticleListProps {
  articles: ArticleRow[]
  categories: { id: string; name: string; slug: string }[]
  page: number
  totalPages: number
  total: number
  canPublish: boolean
  canDelete: boolean
}

export function ArticleList({
  articles,
  categories,
  page,
  totalPages,
  total,
  canPublish,
  canDelete,
}: ArticleListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "")
  const [deleteTarget, setDeleteTarget] = useState<ArticleRow | null>(null)

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 when filters change
    if (key !== "page") {
      params.delete("page")
    }
    router.push(`/admin/berita?${params.toString()}`)
  }

  function handleSearch() {
    updateParams("search", searchValue.trim())
  }

  function handlePublish(id: string) {
    startTransition(async () => {
      const result = await publishArticle(id)
      if (result.success) {
        toast.success("Artikel berhasil dipublikasikan")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await softDeleteArticle(deleteTarget.id)
      if (result.success) {
        toast.success("Artikel berhasil dihapus")
        setDeleteTarget(null)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const columns: Column<ArticleRow>[] = [
    {
      key: "title",
      header: "Judul",
      render: (item) => (
        <div className="max-w-[300px]">
          <p className="font-medium truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">/{item.slug}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      render: (item) => item.category?.name ?? "-",
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant={item.status === "PUBLISHED" ? "default" : "secondary"}>
          {item.status === "PUBLISHED" ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "author",
      header: "Penulis",
      render: (item) => item.author?.name ?? "-",
    },
    {
      key: "date",
      header: "Tanggal",
      render: (item) => formatDate(item.publishedAt ?? item.createdAt),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/admin/berita/${item.id}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          {canPublish && item.status === "DRAFT" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600"
              onClick={() => handlePublish(item.id)}
              disabled={isPending}
            >
              <Globe className="h-4 w-4" />
              <span className="sr-only">Publish</span>
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(item)}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Hapus</span>
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Berita</h1>
          <p className="text-sm text-muted-foreground">{total} artikel</p>
        </div>
        <Button asChild>
          <Link href="/admin/berita/baru">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Artikel
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Cari judul artikel..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch()
            }}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Select
            value={searchParams.get("categoryId") ?? ""}
            onValueChange={(v) => updateParams("categoryId", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={searchParams.get("status") ?? ""}
            onValueChange={(v) => updateParams("status", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <DataTable columns={columns} data={articles} emptyMessage="Belum ada artikel" />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams("page", String(page - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams("page", String(page + 1))}
            >
              Selanjutnya
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Artikel</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus artikel &quot;{deleteTarget?.title}&quot;?
              Artikel akan dipindahkan ke sampah.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
