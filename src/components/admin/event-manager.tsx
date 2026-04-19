"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, CalendarDays, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { createEvent, updateEvent, deleteEvent } from "@/actions/event"
import type { SchoolEvent } from "@prisma/client"

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date))
}

interface FormState {
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
}

const emptyForm: FormState = { title: "", description: "", location: "", startDate: "", endDate: "" }

export function EventManager({ initialItems }: { initialItems: SchoolEvent[] }) {
  const [items, setItems] = useState(initialItems)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<SchoolEvent | null>(null)
  const [isPending, startTransition] = useTransition()

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(item: SchoolEvent) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      description: item.description ?? "",
      location: item.location ?? "",
      startDate: new Date(item.startDate).toISOString().slice(0, 10),
      endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : "",
    })
    setFormOpen(true)
  }

  function handleSave() {
    if (!form.title.trim()) { toast.error("Judul wajib diisi"); return }
    if (!form.startDate) { toast.error("Tanggal mulai wajib diisi"); return }
    startTransition(async () => {
      const data = {
        title: form.title,
        description: form.description || undefined,
        location: form.location || undefined,
        startDate: form.startDate,
        endDate: form.endDate || null,
      }
      const result = editingId
        ? await updateEvent(editingId, data)
        : await createEvent(data)

      if (!result.success) { toast.error(result.error); return }
      toast.success(editingId ? "Agenda diperbarui" : "Agenda ditambahkan")
      setItems((prev) =>
        editingId
          ? prev.map((i) => (i.id === editingId ? result.data! : i))
          : [...prev, result.data!].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      )
      setFormOpen(false)
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteEvent(deleteTarget.id)
      if (!result.success) { toast.error(result.error); return }
      toast.success("Agenda dihapus")
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      setDeleteTarget(null)
    })
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const upcoming = items.filter((i) => new Date(i.startDate) >= now)
  const past = items.filter((i) => new Date(i.startDate) < now)

  return (
    <div className="space-y-6">
      {/* Header Container Modernized */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Agenda & Kegiatan</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Kelola jadwal acara penting dan agenda akademik sekolah.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <Button onClick={openAdd} className="bg-[#002244] hover:bg-[#003366] text-white rounded-xl shadow-lg shadow-[#002244]/20 font-bold transition-all hover:-translate-y-0.5 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Tambah Agenda
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
          <CalendarDays className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-500">Belum ada agenda kegiatan.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest pl-2">Jadwal Mendatang</h3>
              <div className="grid gap-3">
                {upcoming.map((item) => <EventCard key={item.id} item={item} onEdit={openEdit} onDelete={setDeleteTarget} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest pl-2">Sudah Berlalu</h3>
              <div className="grid gap-3">
                {past.map((item) => <EventCard key={item.id} item={item} onEdit={openEdit} onDelete={setDeleteTarget} isPast />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Agenda" : "Tambah Agenda"}</DialogTitle>
            <DialogDescription>Isi detail kegiatan di bawah ini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Kegiatan</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Upacara Hari Kemerdekaan..." />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (opsional)</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Detail kegiatan..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Lokasi (opsional)</Label>
              <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Lapangan Upacara, Aula..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Selesai (opsional)</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
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
            <DialogTitle>Hapus Agenda</DialogTitle>
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

function EventCard({ item, onEdit, onDelete, isPast }: {
  item: SchoolEvent
  onEdit: (item: SchoolEvent) => void
  onDelete: (item: SchoolEvent) => void
  isPast?: boolean
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all ${isPast ? "opacity-60 grayscale-[50%]" : "hover:border-slate-300 hover:shadow-md"}`}>
      <div className="flex flex-col items-center justify-center bg-[#002244] text-white rounded-xl w-14 h-14 shrink-0 shadow-sm border border-[#001833]">
        <span className="text-xl font-extrabold leading-none">
          {new Date(item.startDate).getDate()}
        </span>
        <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-80 mt-0.5">
          {new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(item.startDate))}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-slate-800">{item.title}</p>
        {item.description && <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2">{item.description}</p>}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-slate-400">
          {item.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>}
          {item.endDate && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> s/d {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long" }).format(new Date(item.endDate))}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-white hover:shadow-sm" onClick={() => onEdit(item)}>
          <Pencil className="h-4 w-4 text-blue-600" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(item)}>
          <Trash2 className="h-4 w-4 text-slate-400" />
        </Button>
      </div>
    </div>
  )
}
