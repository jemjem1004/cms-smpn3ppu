"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  createAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncement,
} from "@/actions/announcement"
import type { Announcement } from "@prisma/client"

const TYPE_LABELS: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  INFO: { label: "Info", variant: "secondary" },
  WARNING: { label: "Peringatan", variant: "destructive" },
  SUCCESS: { label: "Sukses", variant: "default" },
}

function formatDate(date: Date | null) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date))
}

interface FormState {
  title: string
  content: string
  type: "INFO" | "WARNING" | "SUCCESS"
  isActive: boolean
  expiresAt: string
}

const emptyForm: FormState = { title: "", content: "", type: "INFO", isActive: true, expiresAt: "" }

export function AnnouncementManager({ initialItems }: { initialItems: Announcement[] }) {
  const [items, setItems] = useState(initialItems)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)
  const [isPending, startTransition] = useTransition()

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(item: Announcement) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      content: item.content ?? "",
      type: item.type,
      isActive: item.isActive,
      expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 10) : "",
    })
    setFormOpen(true)
  }

  function handleSave() {
    if (!form.title.trim()) { toast.error("Judul wajib diisi"); return }
    startTransition(async () => {
      const data = {
        title: form.title,
        content: form.content || undefined,
        type: form.type,
        isActive: form.isActive,
        expiresAt: form.expiresAt || null,
      }
      const result = editingId
        ? await updateAnnouncement(editingId, data)
        : await createAnnouncement(data)

      if (!result.success) { toast.error(result.error); return }
      toast.success(editingId ? "Pengumuman diperbarui" : "Pengumuman ditambahkan")
      setItems((prev) =>
        editingId
          ? prev.map((i) => (i.id === editingId ? result.data! : i))
          : [result.data!, ...prev]
      )
      setFormOpen(false)
    })
  }

  function handleToggle(item: Announcement) {
    startTransition(async () => {
      const result = await toggleAnnouncement(item.id, !item.isActive)
      if (!result.success) { toast.error(result.error); return }
      setItems((prev) => prev.map((i) => (i.id === item.id ? result.data! : i)))
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteAnnouncement(deleteTarget.id)
      if (!result.success) { toast.error(result.error); return }
      toast.success("Pengumuman dihapus")
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      setDeleteTarget(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Container Modernized */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Papan Pengumuman</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Kelola informasi prioritas dan pembaruan yang tampil di halaman utama.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <Button onClick={openAdd} className="bg-[#002244] hover:bg-[#003366] text-white rounded-xl shadow-lg shadow-[#002244]/20 font-bold transition-all hover:-translate-y-0.5 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Tambah Pengumuman
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
          <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-500">Belum ada pengumuman</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-lg font-bold text-slate-800">{item.title}</span>
                  <Badge variant={TYPE_LABELS[item.type].variant} className="ml-2 shadow-sm">{TYPE_LABELS[item.type].label}</Badge>
                  {!item.isActive && <Badge variant="outline" className="text-slate-400 border-slate-200">Nonaktif</Badge>}
                </div>
                {item.content && <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2">{item.content}</p>}
                <p className="text-xs font-semibold text-slate-400 mt-2">
                  Berakhir pada: {item.expiresAt ? formatDate(item.expiresAt) : "Tidak ada batas waktu"}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-white hover:shadow-sm" onClick={() => handleToggle(item)} title={item.isActive ? "Nonaktifkan" : "Aktifkan"}>
                  {item.isActive
                    ? <ToggleRight className="h-5 w-5 text-emerald-500" />
                    : <ToggleLeft className="h-5 w-5 text-slate-400" />}
                </Button>
                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-white hover:shadow-sm" onClick={() => openEdit(item)}>
                  <Pencil className="h-4 w-4 text-blue-600" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteTarget(item)}>
                  <Trash2 className="h-4 w-4 text-slate-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pengumuman" : "Tambah Pengumuman"}</DialogTitle>
            <DialogDescription>Isi detail pengumuman di bawah ini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Pendaftaran PPDB dibuka..." />
            </div>
            <div className="space-y-2">
              <Label>Isi Pengumuman (opsional)</Label>
              <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Detail pengumuman..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as FormState["type"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Peringatan</SelectItem>
                    <SelectItem value="SUCCESS">Sukses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.isActive ? "active" : "inactive"} onValueChange={(v) => setForm((f) => ({ ...f, isActive: v === "active" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tanggal Kadaluarsa (opsional)</Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
              <p className="text-xs text-muted-foreground">Kosongkan jika tidak ada batas waktu</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isPending}>{editingId ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengumuman</DialogTitle>
            <DialogDescription>Yakin ingin menghapus &quot;{deleteTarget?.title}&quot;?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
