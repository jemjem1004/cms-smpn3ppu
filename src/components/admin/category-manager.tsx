"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createCategory, updateCategory, deleteCategory } from "@/actions/category"

interface Category {
  id: string
  name: string
  slug: string
  _count: { articles: number }
}

interface CategoryManagerProps {
  initialCategories: Category[]
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManual, setSlugManual] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  function openCreateDialog() {
    setEditingCategory(null)
    setName("")
    setSlug("")
    setSlugManual(false)
    setErrors({})
    setDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setName(category.name)
    setSlug(category.slug)
    setSlugManual(true)
    setErrors({})
    setDialogOpen(true)
  }

  function openDeleteDialog(category: Category) {
    setDeletingCategory(category)
    setDeleteDialogOpen(true)
  }

  function handleNameChange(value: string) {
    setName(value)
    if (!slugManual) {
      setSlug(generateSlug(value))
    }
  }

  function handleSave() {
    setErrors({})
    startTransition(async () => {
      let result
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, { name, slug })
      } else {
        result = await createCategory({ name, slug })
      }

      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors)
        }
        toast.error(result.error)
        return
      }

      if (editingCategory) {
        setCategories(prev =>
          prev.map(c => c.id === editingCategory.id 
            ? { ...c, name: result.data.name, slug: result.data.slug }
            : c
          )
        )
        toast.success("Kategori berhasil diperbarui")
      } else {
        setCategories(prev => [...prev, { ...result.data, _count: { articles: 0 } }])
        toast.success("Kategori berhasil dibuat")
      }

      setDialogOpen(false)
    })
  }

  function handleDelete() {
    if (!deletingCategory) return
    
    startTransition(async () => {
      const result = await deleteCategory(deletingCategory.id)
      
      if (!result.success) {
        toast.error(result.error)
        return
      }

      setCategories(prev => prev.filter(c => c.id !== deletingCategory.id))
      toast.success("Kategori berhasil dihapus")
      setDeleteDialogOpen(false)
      setDeletingCategory(null)
    })
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategori Artikel</h1>
          <p className="text-muted-foreground">
            Kelola kategori untuk mengorganisir artikel berita
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Tag className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Belum ada kategori</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Buat kategori pertama untuk mengorganisir artikel Anda
          </p>
          <Button className="mt-4" onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Jumlah Artikel</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-sm">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{category._count.articles}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(category)}
                        disabled={category._count.articles > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}


      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Perbarui informasi kategori"
                : "Buat kategori baru untuk artikel"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nama Kategori</Label>
              <Input
                id="category-name"
                placeholder="Contoh: Pengumuman"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                placeholder="contoh-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugManual(true)
                }}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug[0]}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Slug digunakan untuk URL. Hanya huruf kecil, angka, dan strip.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori &quot;{deletingCategory?.name}&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
