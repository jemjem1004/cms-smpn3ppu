"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Globe, EyeOff, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deletePage, togglePublishPage } from "@/actions/page"
import type { Page } from "@prisma/client"

interface PageListProps {
  pages: Page[]
}

export function PageList({ pages: initialPages }: PageListProps) {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleTogglePublish(page: Page) {
    startTransition(async () => {
      const result = await togglePublishPage(page.id, !page.isPublished)
      if (result.success) {
        setPages((prev) =>
          prev.map((p) => (p.id === page.id ? { ...p, isPublished: !page.isPublished } : p))
        )
        toast.success(page.isPublished ? "Halaman disembunyikan" : "Halaman dipublikasikan")
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deletePage(deleteTarget.id)
      if (result.success) {
        setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id))
        toast.success("Halaman berhasil dihapus")
      } else {
        toast.error(result.error)
      }
      setDeleteTarget(null)
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Container Modernized */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Halaman Kustom</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Buat halaman mandiri seperti Profil, Visi Misi, Jurusan, dll. Tautkan ke navigasi Menu Builder.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <Button asChild className="bg-[#002244] hover:bg-[#003366] text-white rounded-xl shadow-lg shadow-[#002244]/20 font-bold transition-all hover:-translate-y-0.5 w-full sm:w-auto">
            <Link href="/admin/halaman/baru">
              <Plus className="mr-2 h-4 w-4" />
              Buat Halaman
            </Link>
          </Button>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 bg-slate-50/50">
          <FileText className="mx-auto mb-3 h-12 w-12 text-slate-400" />
          <p className="font-medium">Belum ada halaman kustom.</p>
          <p className="text-sm text-slate-400 mt-1">
            Klik &quot;Buat Halaman&quot; untuk membuat halaman statis seperti Profil, Visi Misi, Jurusan, dll.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold text-slate-700">Judul</TableHead>
                <TableHead className="font-bold text-slate-700">Slug / URL</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                      /halaman/{page.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.isPublished ? "default" : "secondary"}>
                      {page.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={page.isPublished ? "Sembunyikan" : "Publikasikan"}
                        onClick={() => handleTogglePublish(page)}
                        disabled={isPending}
                      >
                        {page.isPublished ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Globe className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/halaman/${page.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(page)}
                        disabled={isPending}
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

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Halaman</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus halaman &quot;{deleteTarget?.title}&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
