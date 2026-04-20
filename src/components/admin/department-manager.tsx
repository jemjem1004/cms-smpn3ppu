"use client"

import { useState, useTransition } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  ChevronDown,
  X,
  GripVertical,
  Save,
  LayoutGrid,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/admin/image-uploader"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createDepartment, updateDepartment, deleteDepartment } from "@/actions/department"
import type { Department } from "@prisma/client"

// ─── Types & Helpers ────────────────────────────────────────────────────────

function generateSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

interface FormState {
  name: string
  slug: string
  description: string
  imageUrl: string
  headName: string
  headPhoto: string
  headTitle: string
  kompetensi: string[]
  bidangKerja: string[]
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  headName: "",
  headPhoto: "",
  headTitle: "",
  kompetensi: [],
  bidangKerja: [],
}

// ─── Sortable Table Row Component ───────────────────────────────────────────

function SortableRow({
  item,
  onEdit,
  onDelete,
}: {
  item: Department
  onEdit: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-slate-50 shadow-sm" : ""}>
      <TableCell className="w-10">
        <button
          className="cursor-grab touch-none rounded p-1 text-slate-400 hover:text-slate-600 transition-colors"
          {...attributes}
          {...listeners}
          aria-label="Seret untuk mengatur urutan"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="w-16">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
            <LayoutGrid className="h-5 w-5" />
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{item.name}</span>
          <span className="text-xs text-slate-400 font-mono mt-0.5">/jurusan/{item.slug}</span>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell max-w-xs overflow-hidden">
        <p className="text-sm text-slate-500 line-clamp-1">
          {item.description || "Tidak ada deskripsi"}
        </p>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-500 hover:text-[#002244] hover:bg-slate-100"
            onClick={onEdit}
            title="Edit Jurusan"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
            onClick={onDelete}
            title="Hapus Jurusan"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

// ─── Main Manager Component ──────────────────────────────────────────────────

export function DepartmentManager({ initialItems }: { initialItems: Department[] }) {
  const [items, setItems] = useState(initialItems)
  const [orderChanged, setOrderChanged] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [slugManual, setSlugManual] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ─── Actions ───────────────────────────────────────────────────

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id)
      const newIndex = prev.findIndex((i) => i.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
    setOrderChanged(true)
  }

  async function handleSaveOrder() {
    setSavingOrder(true)
    try {
      const promises = items.map((item, index) =>
        updateDepartment(item.id, {
          name: item.name,
          order: index,
        })
      )
      const results = await Promise.all(promises)
      const failed = results.find((r) => !r.success)
      if (failed && !failed.success) {
        toast.error(failed.error)
        return
      }
      setOrderChanged(false)
      toast.success("Urutan jurusan berhasil disimpan")
    } catch {
      toast.error("Gagal menyimpan urutan")
    } finally {
      setSavingOrder(false)
    }
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setSlugManual(false)
    setFormOpen(true)
  }

  function openEdit(item: Department) {
    setEditingId(item.id)
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      headName: item.headName ?? "",
      headPhoto: item.headPhoto ?? "",
      headTitle: item.headTitle ?? "",
      kompetensi: item.kompetensi ?? [],
      bidangKerja: item.bidangKerja ?? [],
    })
    setSlugManual(true)
    setFormOpen(true)
  }

  function handleNameChange(val: string) {
    setForm((f) => ({ ...f, name: val, slug: slugManual ? f.slug : generateSlug(val) }))
  }

  function addListItem(field: "kompetensi" | "bidangKerja") {
    setForm((f) => ({ ...f, [field]: [...f[field], ""] }))
  }
  function updateListItem(field: "kompetensi" | "bidangKerja", idx: number, val: string) {
    setForm((f) => ({ ...f, [field]: f[field].map((v, i) => i === idx ? val : v) }))
  }
  function removeListItem(field: "kompetensi" | "bidangKerja", idx: number) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }))
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Nama jurusan wajib diisi")
      return
    }
    startTransition(async () => {
      const data = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        headName: form.headName || undefined,
        headPhoto: form.headPhoto || undefined,
        headTitle: form.headTitle || undefined,
        kompetensi: form.kompetensi.filter(Boolean),
        bidangKerja: form.bidangKerja.filter(Boolean),
      }
      const result = editingId ? await updateDepartment(editingId, data) : await createDepartment(data)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(editingId ? "Jurusan diperbarui" : "Jurusan ditambahkan")
      setItems((prev) => editingId
        ? prev.map((i) => i.id === editingId ? result.data! : i)
        : [...prev, result.data!]
      )
      setFormOpen(false)
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteDepartment(deleteTarget.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Jurusan dihapus")
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      setDeleteTarget(null)
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ─── Modern Header Section ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50/30 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Jurusan / Program Keahlian</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1.5 max-w-2xl">
            Kelola data program keahlian sekolah. Setiap jurusan memiliki halaman profil publik secara otomatis.
          </p>
        </div>

        <div className="flex gap-3 relative z-10 w-full sm:w-auto">
          {orderChanged && (
            <Button 
              onClick={handleSaveOrder} 
              disabled={savingOrder} 
              variant="outline" 
              className="rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 font-semibold w-full sm:w-auto transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              {savingOrder ? "Menyimpan..." : "Simpan Urutan"}
            </Button>
          )}
          <Button 
            onClick={openAdd} 
            className="bg-[#002244] hover:bg-[#003366] text-white rounded-xl shadow-lg shadow-[#002244]/20 font-bold transition-all hover:-translate-y-0.5 w-full sm:w-auto px-6"
          >
            <Plus className="mr-2 h-5 w-5" /> Tambah Jurusan
          </Button>
        </div>
      </div>

      {/* ─── Content Section ────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center bg-white shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <BookOpen className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Belum ada jurusan</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">
            Mulai tambahkan program keahlian untuk menampilkan informasi konsentrasi keahlian di website sekolah.
          </p>
          <Button onClick={openAdd} variant="outline" className="mt-6 rounded-xl border-slate-200 hover:bg-slate-50">
            Tambah Sekarang
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden border-t-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent border-slate-200">
                    <TableHead className="w-10" />
                    <TableHead className="w-16 font-bold text-slate-700">Cover</TableHead>
                    <TableHead className="font-bold text-slate-700">Nama Jurusan</TableHead>
                    <TableHead className="hidden md:table-cell font-bold text-slate-700">Deskripsi Singkat</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onEdit={() => openEdit(item)}
                      onDelete={() => setDeleteTarget(item)}
                    />
                  ))}
                </TableBody>
              </Table>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* ─── Form Dialog ────────────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl rounded-3xl">
          <DialogHeader className="p-8 bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
            <DialogTitle className="text-2xl font-extrabold text-slate-900 leading-none">
              {editingId ? "Edit Jurusan" : "Tambah Jurusan Baru"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-2 font-medium">
              Konfigurasikan data program keahlian. Perubahan akan langsung berdampak pada halaman publik.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Nama Jurusan *</Label>
                <Input 
                  value={form.name} 
                  onChange={(e) => handleNameChange(e.target.value)} 
                  placeholder="e.g. Teknik Komputer dan Jaringan" 
                  className="rounded-xl border-slate-200 focus:ring-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Slug URL / Path</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-medium">/</span>
                  <Input 
                    value={form.slug} 
                    onChange={(e) => { setForm((f) => ({ ...f, slug: e.target.value })); setSlugManual(true) }} 
                    placeholder="tek-komputer" 
                    className="pl-6 rounded-xl border-slate-200 font-mono text-sm bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Deskripsi Program</Label>
              <Textarea 
                value={form.description} 
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
                rows={4} 
                placeholder="Jelaskan secara singkat tentang fokus utama dan profil program keahlian ini..." 
                className="rounded-xl border-slate-200 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Gambar Banner Jurusan</Label>
              <ImageUploader 
                currentImageUrl={form.imageUrl || undefined} 
                onUploadComplete={(url) => setForm((f) => ({ ...f, imageUrl: url }))} 
                 
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4">Profil Ketua Program (Opsional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600">Nama Lengkap</Label>
                  <Input value={form.headName} onChange={(e) => setForm((f) => ({ ...f, headName: e.target.value }))} placeholder="Nama Beserta Gelar" className="rounded-xl border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600">Bidang / Jabatan</Label>
                  <Input value={form.headTitle} onChange={(e) => setForm((f) => ({ ...f, headTitle: e.target.value }))} placeholder="e.g. Head of IT Department" className="rounded-xl border-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">Foto Ketua</Label>
                <ImageUploader currentImageUrl={form.headPhoto || undefined} onUploadComplete={(url) => setForm((f) => ({ ...f, headPhoto: url }))}  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Materi Inti
                  </Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => addListItem("kompetensi")} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Plus className="h-4 w-4 mr-1" /> Tambah
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.kompetensi.map((val, i) => (
                    <div key={i} className="group flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Input value={val} onChange={(e) => updateListItem("kompetensi", i, e.target.value)} placeholder={`Materi ${i + 1}`} className="rounded-xl border-slate-200 flex-1" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem("kompetensi", i)} className="opacity-40 group-hover:opacity-100 text-red-500 hover:bg-red-50 rounded-xl">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {form.kompetensi.length === 0 && <p className="text-xs text-slate-400 italic">Klik tambah untuk mengisi materi yang diajarkan.</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Prospek Kerja
                  </Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => addListItem("bidangKerja")} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    <Plus className="h-4 w-4 mr-1" /> Tambah
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.bidangKerja.map((val, i) => (
                    <div key={i} className="group flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Input value={val} onChange={(e) => updateListItem("bidangKerja", i, e.target.value)} placeholder={`Peluang kerja ${i + 1}`} className="rounded-xl border-slate-200 flex-1" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem("bidangKerja", i)} className="opacity-40 group-hover:opacity-100 text-red-500 hover:bg-red-50 rounded-xl">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {form.bidangKerja.length === 0 && <p className="text-xs text-slate-400 italic">Klik tambah untuk mengisi prospek lulusan.</p>}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 sticky bottom-0 z-10 sm:justify-between">
            <Button variant="outline" onClick={() => setFormOpen(false)} className="rounded-xl bg-white border-slate-200 hover:bg-slate-50 px-6">Batal</Button>
            <Button onClick={handleSave} disabled={isPending} className="bg-[#002244] hover:bg-[#003366] text-white rounded-xl px-10 font-bold shadow-lg shadow-[#002244]/10">
              {isPending ? "Memproses..." : (editingId ? "Simpan Perubahan" : "Buat Jurusan")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0">
          <div className="p-8 pb-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-5 border border-red-100">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-slate-900">Hapus Jurusan?</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2 text-base leading-relaxed">
              Konfirmasi penghapusan <span className="font-bold text-slate-800">&quot;{deleteTarget?.name}&quot;</span>. 
              Tindakan ini tidak dapat dibatalkan dan semua data kompetensi serta prospek kerja akan hilang.
            </DialogDescription>
          </div>
          <DialogFooter className="p-6 bg-slate-50 sm:justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="rounded-xl hover:bg-slate-100 font-medium">Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="rounded-xl bg-red-600 hover:bg-red-700 px-6 font-bold shadow-lg shadow-red-600/20">
              {isPending ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
