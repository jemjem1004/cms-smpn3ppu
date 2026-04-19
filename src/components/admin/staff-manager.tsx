"use client"

import { useState } from "react"
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
  Trash2,
  Pencil,
  GripVertical,
  Save,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import { ImageUploader } from "@/components/admin/image-uploader"
import { createStaff, updateStaff, deleteStaff } from "@/actions/staff"

// ─── Types ───────────────────────────────────────────────────────

interface StaffItem {
  id: string
  name: string
  position: string
  photoUrl: string | null
  order: number
}

interface StaffManagerProps {
  staff: StaffItem[]
}

// ─── Sortable Table Row ──────────────────────────────────────────

function SortableRow({
  item,
  onEdit,
  onDelete,
}: {
  item: StaffItem
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
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        <button
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
          aria-label="Seret untuk mengatur urutan"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="w-12">
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={item.name}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.position}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            aria-label="Edit guru"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label="Hapus guru"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

// ─── Main Component ──────────────────────────────────────────────

export function StaffManager({ staff: initialStaff }: StaffManagerProps) {
  const [staff, setStaff] = useState<StaffItem[]>(initialStaff)
  const [orderChanged, setOrderChanged] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<StaffItem | null>(null)
  const [formName, setFormName] = useState("")
  const [formPosition, setFormPosition] = useState("")
  const [formPhotoUrl, setFormPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<StaffItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ─── Drag end ───────────────────────────────────────────────

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setStaff((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id)
      const newIndex = prev.findIndex((s) => s.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
    setOrderChanged(true)
  }

  // ─── Save order ─────────────────────────────────────────────

  async function handleSaveOrder() {
    setSavingOrder(true)
    try {
      // Update each staff member with their new order
      const promises = staff.map((item, index) =>
        updateStaff(item.id, {
          name: item.name,
          position: item.position,
          photoUrl: item.photoUrl ?? undefined,
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
      toast.success("Urutan guru berhasil disimpan")
    } catch {
      toast.error("Gagal menyimpan urutan")
    } finally {
      setSavingOrder(false)
    }
  }

  // ─── Open form ──────────────────────────────────────────────

  function openAddForm() {
    setEditTarget(null)
    setFormName("")
    setFormPosition("")
    setFormPhotoUrl(null)
    setFormOpen(true)
  }

  function openEditForm(item: StaffItem) {
    setEditTarget(item)
    setFormName(item.name)
    setFormPosition(item.position)
    setFormPhotoUrl(item.photoUrl)
    setFormOpen(true)
  }

  // ─── Save form ──────────────────────────────────────────────

  async function handleSaveForm() {
    if (!formName.trim()) {
      toast.error("Nama wajib diisi")
      return
    }
    if (!formPosition.trim()) {
      toast.error("Jabatan wajib diisi")
      return
    }

    setSaving(true)
    try {
      if (editTarget) {
        // Update existing
        const result = await updateStaff(editTarget.id, {
          name: formName.trim(),
          position: formPosition.trim(),
          photoUrl: formPhotoUrl ?? undefined,
          order: editTarget.order,
        })
        if (!result.success) {
          toast.error(result.error)
          return
        }
        setStaff((prev) =>
          prev.map((s) =>
            s.id === editTarget.id
              ? {
                  ...s,
                  name: formName.trim(),
                  position: formPosition.trim(),
                  photoUrl: formPhotoUrl,
                }
              : s
          )
        )
        toast.success("Data guru berhasil diperbarui")
      } else {
        // Create new
        const result = await createStaff({
          name: formName.trim(),
          position: formPosition.trim(),
          photoUrl: formPhotoUrl ?? undefined,
        })
        if (!result.success) {
          toast.error(result.error)
          return
        }
        if (result.data) {
          setStaff((prev) => [
            ...prev,
            {
              id: result.data.id,
              name: result.data.name,
              position: result.data.position,
              photoUrl: result.data.photoUrl,
              order: result.data.order,
            },
          ])
        }
        toast.success("Data guru berhasil ditambahkan")
      }
      setFormOpen(false)
    } catch {
      toast.error("Gagal menyimpan data guru")
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete ─────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const result = await deleteStaff(deleteTarget.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      toast.success("Data guru berhasil dihapus")
    } catch {
      toast.error("Gagal menghapus data guru")
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Guru</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data guru dan tenaga kependidikan. Seret untuk mengatur urutan tampil.
          </p>
        </div>
        <div className="flex gap-2">
          {orderChanged && (
            <Button onClick={handleSaveOrder} disabled={savingOrder}>
              <Save className="mr-2 h-4 w-4" />
              {savingOrder ? "Menyimpan..." : "Simpan Urutan"}
            </Button>
          )}
          <Button variant="outline" onClick={openAddForm}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Guru
          </Button>
        </div>
      </div>

      {staff.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 h-12 w-12" />
          <p>Belum ada data guru.</p>
          <p className="text-sm">Klik &quot;Tambah Guru&quot; untuk memulai.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={staff.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead className="w-12">Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onEdit={() => openEditForm(item)}
                      onDelete={() => setDeleteTarget(item)}
                    />
                  ))}
                </TableBody>
              </Table>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* ─── Add/Edit Dialog ─────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Data Guru" : "Tambah Guru Baru"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Perbarui informasi guru di bawah ini."
                : "Isi informasi guru baru di bawah ini."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Nama *</Label>
              <Input
                id="staff-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nama lengkap guru"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-position">Jabatan *</Label>
              <Input
                id="staff-position"
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
                placeholder="Jabatan atau mata pelajaran"
              />
            </div>
            <div className="space-y-2">
              <Label>Foto</Label>
              <ImageUploader
                onUploadComplete={(url) => setFormPhotoUrl(url)}
                currentImageUrl={formPhotoUrl ?? undefined}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveForm} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ────────────────────────── */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Data Guru</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data guru &quot;{deleteTarget?.name}&quot;?
              Data dan foto terkait akan dihapus secara permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
