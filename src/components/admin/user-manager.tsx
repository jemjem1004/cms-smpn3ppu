"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Plus,
  UserX,
  KeyRound,
  Users,
  Copy,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createUser, deactivateUser, resetPassword } from "@/actions/user"

// ─── Types ───────────────────────────────────────────────────────

type Role = "SUPER_ADMIN" | "EDITOR" | "CONTRIBUTOR"

interface UserItem {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
}

interface UserManagerProps {
  users: UserItem[]
}

// ─── Helpers ─────────────────────────────────────────────────────

function roleBadgeVariant(role: Role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "destructive" as const
    case "EDITOR":
      return "default" as const
    case "CONTRIBUTOR":
      return "secondary" as const
  }
}

function roleLabel(role: Role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin"
    case "EDITOR":
      return "Editor"
    case "CONTRIBUTOR":
      return "Contributor"
  }
}

// ─── Main Component ──────────────────────────────────────────────

export function UserManager({ users: initialUsers }: UserManagerProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers)

  // Add user dialog
  const [addOpen, setAddOpen] = useState(false)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState<Role>("CONTRIBUTOR")
  const [saving, setSaving] = useState(false)

  // Deactivate dialog
  const [deactivateTarget, setDeactivateTarget] = useState<UserItem | null>(null)
  const [deactivating, setDeactivating] = useState(false)

  // Reset password dialog
  const [resetTarget, setResetTarget] = useState<UserItem | null>(null)
  const [resetting, setResetting] = useState(false)

  // Temporary password result dialog
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [tempPasswordUser, setTempPasswordUser] = useState<string>("")

  // ─── Create user ────────────────────────────────────────────

  function openAddForm() {
    setFormName("")
    setFormEmail("")
    setFormPassword("")
    setFormRole("CONTRIBUTOR")
    setAddOpen(true)
  }

  async function handleCreateUser() {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      toast.error("Semua field wajib diisi")
      return
    }
    setSaving(true)
    try {
      const result = await createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      if (result.data) {
        setUsers((prev) => [
          {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            role: result.data.role,
            isActive: result.data.isActive,
          },
          ...prev,
        ])
      }
      toast.success("Pengguna berhasil ditambahkan")
      setAddOpen(false)
    } catch {
      toast.error("Gagal menambahkan pengguna")
    } finally {
      setSaving(false)
    }
  }

  // ─── Deactivate user ───────────────────────────────────────

  async function handleDeactivate() {
    if (!deactivateTarget) return
    setDeactivating(true)
    try {
      const result = await deactivateUser(deactivateTarget.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === deactivateTarget.id ? { ...u, isActive: false } : u
        )
      )
      toast.success("Pengguna berhasil dinonaktifkan")
    } catch {
      toast.error("Gagal menonaktifkan pengguna")
    } finally {
      setDeactivating(false)
      setDeactivateTarget(null)
    }
  }

  // ─── Reset password ────────────────────────────────────────

  async function handleResetPassword() {
    if (!resetTarget) return
    setResetting(true)
    try {
      const result = await resetPassword(resetTarget.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setTempPasswordUser(resetTarget.name)
      setTempPassword(result.data.temporaryPassword)
      toast.success("Password berhasil direset")
    } catch {
      toast.error("Gagal mereset password")
    } finally {
      setResetting(false)
      setResetTarget(null)
    }
  }

  function copyTempPassword() {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword)
      toast.success("Password disalin ke clipboard")
    }
  }

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengguna</h1>
          <p className="text-sm text-muted-foreground">
            Kelola akun pengguna dan staf admin.
          </p>
        </div>
        <Button variant="outline" onClick={openAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 h-12 w-12" />
          <p>Belum ada data pengguna.</p>
          <p className="text-sm">Klik &quot;Tambah Pengguna&quot; untuk memulai.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(user.role)}>
                      {roleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className={
                        user.isActive
                          ? "bg-green-600 hover:bg-green-600/80"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {user.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive hover:text-destructive"
                          onClick={() => setDeactivateTarget(user)}
                        >
                          <UserX className="mr-1 h-4 w-4" />
                          Nonaktifkan
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => setResetTarget(user)}
                      >
                        <KeyRound className="mr-1 h-4 w-4" />
                        Reset Password
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ─── Add User Dialog ──────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>
              Isi informasi pengguna baru di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nama *</Label>
              <Input
                id="user-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@contoh.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Password *</Label>
              <Input
                id="user-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Role *</Label>
              <Select
                value={formRole}
                onValueChange={(v) => setFormRole(v as Role)}
              >
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateUser} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Deactivate Confirmation Dialog ────────────────────── */}
      <Dialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nonaktifkan Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menonaktifkan akun &quot;{deactivateTarget?.name}&quot;?
              Pengguna ini tidak akan dapat login setelah dinonaktifkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivating}
            >
              {deactivating ? "Menonaktifkan..." : "Nonaktifkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Reset Password Confirmation Dialog ────────────────── */}
      <Dialog
        open={resetTarget !== null}
        onOpenChange={(open) => {
          if (!open) setResetTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mereset password akun &quot;{resetTarget?.name}&quot;?
              Password baru akan digenerate secara otomatis.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)}>
              Batal
            </Button>
            <Button onClick={handleResetPassword} disabled={resetting}>
              {resetting ? "Mereset..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Temporary Password Result Dialog ──────────────────── */}
      <Dialog
        open={tempPassword !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTempPassword(null)
            setTempPasswordUser("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Baru</DialogTitle>
            <DialogDescription>
              Password baru untuk &quot;{tempPasswordUser}&quot; telah digenerate.
              Salin dan berikan kepada pengguna.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
            <code className="flex-1 text-sm font-mono">{tempPassword}</code>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyTempPassword}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setTempPassword(null)
                setTempPasswordUser("")
              }}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
