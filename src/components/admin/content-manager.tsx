"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { updateInstitutionalContent } from "@/actions/content"
import type { HeroContent, HeroSlide, ProfileContent, PrincipalContent, DepartmentContent } from "@/types"

interface ContentManagerProps {
  heroContent: HeroContent | null
  profileContent: ProfileContent | null
  principalContent: PrincipalContent | null
  departmentContent: DepartmentContent | null
}

const defaultHero: HeroContent = {
  slides: [],
}

const defaultProfile: ProfileContent = {
  description: "",
  videoUrl: "",
  visi: "",
  misi: "",
  sejarah: "",
}

const defaultPrincipal: PrincipalContent = {
  message: "",
  name: "",
  title: "",
  photoUrl: "",
}

const defaultDepartment: DepartmentContent = {
  departments: [],
}

export function ContentManager({
  heroContent,
  profileContent,
  principalContent,
  departmentContent,
}: ContentManagerProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Container Modernized */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Konten</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Kelola konten institusional website sekolah (Hero, Profil, Prakata, dsb).
          </p>
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="prakata">Prakata Kepsek</TabsTrigger>
          <TabsTrigger value="jurusan">Jurusan</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <HeroTab initialData={heroContent ?? defaultHero} />
        </TabsContent>

        <TabsContent value="profil">
          <ProfilTab initialData={profileContent ?? defaultProfile} />
        </TabsContent>

        <TabsContent value="prakata">
          <PrakataTab initialData={principalContent ?? defaultPrincipal} />
        </TabsContent>

        <TabsContent value="jurusan">
          <JurusanTab initialData={departmentContent ?? defaultDepartment} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// Hero Section Tab
// ============================================

function HeroTab({ initialData }: { initialData: HeroContent }) {
  // Support old format migration
  const initialSlides: HeroSlide[] = Array.isArray(initialData.slides)
    ? initialData.slides
    : []

  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides)
  const [saving, setSaving] = useState(false)

  function addSlide() {
    if (slides.length >= 5) {
      toast.error("Maksimal 5 slide")
      return
    }
    setSlides((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        imageUrl: "",
        badgeLabel: "",
        ctaText: "Baca Lebih Lanjut",
        ctaUrl: "/berita",
      },
    ])
  }

  function removeSlide(id: string) {
    setSlides((prev) => prev.filter((s) => s.id !== id))
  }

  function updateSlide(id: string, field: keyof HeroSlide, value: string) {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      const result = await updateInstitutionalContent("HERO", { slides })
      if (result.success) {
        toast.success("Hero section berhasil disimpan")
      } else {
        toast.error(result.error || "Gagal menyimpan hero section")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Hero Section Slider</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola slide hero (maks. 5 slide). Setiap slide tampil bergantian di landing page.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addSlide} disabled={slides.length >= 5}>
          + Tambah Slide
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {slides.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Belum ada slide. Klik &quot;Tambah Slide&quot; untuk menambahkan.
          </p>
        )}

        {slides.map((slide, index) => (
          <div key={slide.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Slide #{index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeSlide(slide.id)}
              >
                Hapus
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                placeholder="Judul slide"
                value={slide.title}
                onChange={(e) => updateSlide(slide.id, "title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Deskripsi slide"
                rows={2}
                value={slide.description}
                onChange={(e) => updateSlide(slide.id, "description", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>URL Gambar</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={slide.imageUrl}
                onChange={(e) => updateSlide(slide.id, "imageUrl", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Label Badge</Label>
              <Input
                placeholder="Contoh: Prestasi Siswa"
                value={slide.badgeLabel}
                onChange={(e) => updateSlide(slide.id, "badgeLabel", e.target.value)}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Teks CTA</Label>
                <Input
                  placeholder="Baca Lebih Lanjut"
                  value={slide.ctaText}
                  onChange={(e) => updateSlide(slide.id, "ctaText", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>URL CTA</Label>
                <Input
                  placeholder="/berita/artikel"
                  value={slide.ctaUrl}
                  onChange={(e) => updateSlide(slide.id, "ctaUrl", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        {slides.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Hero Section"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Profil Tab
// ============================================

function ProfilTab({ initialData }: { initialData: ProfileContent }) {
  const [data, setData] = useState<ProfileContent>(initialData)
  const [saving, setSaving] = useState(false)

  function update(field: keyof ProfileContent, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const result = await updateInstitutionalContent("PROFILE", data)
      if (result.success) {
        toast.success("Profil sekolah berhasil disimpan")
      } else {
        toast.error(result.error || "Gagal menyimpan profil")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Sekolah</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profil-description">Deskripsi</Label>
          <Textarea
            id="profil-description"
            placeholder="Deskripsi profil sekolah"
            rows={3}
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profil-videoUrl">URL Video</Label>
          <Input
            id="profil-videoUrl"
            placeholder="https://youtube.com/watch?v=..."
            value={data.videoUrl}
            onChange={(e) => update("videoUrl", e.target.value)}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="profil-visi">Visi</Label>
          <Textarea
            id="profil-visi"
            placeholder="Visi sekolah"
            rows={4}
            value={data.visi}
            onChange={(e) => update("visi", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profil-misi">Misi</Label>
          <Textarea
            id="profil-misi"
            placeholder="Misi sekolah"
            rows={4}
            value={data.misi}
            onChange={(e) => update("misi", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profil-sejarah">Sejarah</Label>
          <Textarea
            id="profil-sejarah"
            placeholder="Sejarah sekolah"
            rows={6}
            value={data.sejarah}
            onChange={(e) => update("sejarah", e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Prakata Kepala Sekolah Tab
// ============================================

function PrakataTab({ initialData }: { initialData: PrincipalContent }) {
  const [data, setData] = useState<PrincipalContent>(initialData)
  const [saving, setSaving] = useState(false)

  function update(field: keyof PrincipalContent, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const result = await updateInstitutionalContent("PRINCIPAL_MESSAGE", data)
      if (result.success) {
        toast.success("Prakata kepala sekolah berhasil disimpan")
      } else {
        toast.error(result.error || "Gagal menyimpan prakata")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prakata Kepala Sekolah</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prakata-message">Teks Prakata</Label>
          <Textarea
            id="prakata-message"
            placeholder="Teks prakata kepala sekolah"
            rows={8}
            value={data.message}
            onChange={(e) => update("message", e.target.value)}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="prakata-name">Nama Kepala Sekolah</Label>
            <Input
              id="prakata-name"
              placeholder="Nama lengkap"
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prakata-title">Jabatan</Label>
            <Input
              id="prakata-title"
              placeholder="Kepala Sekolah"
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prakata-photoUrl">URL Foto</Label>
          <Input
            id="prakata-photoUrl"
            placeholder="https://example.com/foto.jpg"
            value={data.photoUrl}
            onChange={(e) => update("photoUrl", e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Prakata"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Jurusan Tab
// ============================================

interface Department {
  id: string
  name: string
  description: string
  imageUrl: string
}

function JurusanTab({ initialData }: { initialData: DepartmentContent }) {
  const [departments, setDepartments] = useState<Department[]>(
    initialData.departments
  )
  const [saving, setSaving] = useState(false)

  function addDepartment() {
    setDepartments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", description: "", imageUrl: "" },
    ])
  }

  function removeDepartment(id: string) {
    setDepartments((prev) => prev.filter((d) => d.id !== id))
  }

  function updateDepartment(id: string, field: keyof Department, value: string) {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      const result = await updateInstitutionalContent("DEPARTMENT", {
        departments,
      })
      if (result.success) {
        toast.success("Data jurusan berhasil disimpan")
      } else {
        toast.error(result.error || "Gagal menyimpan data jurusan")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jurusan / Program Keahlian</CardTitle>
        <Button variant="outline" size="sm" onClick={addDepartment}>
          + Tambah Jurusan
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {departments.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Belum ada jurusan. Klik &quot;Tambah Jurusan&quot; untuk menambahkan.
          </p>
        )}

        {departments.map((dept, index) => (
          <div key={dept.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Jurusan #{index + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeDepartment(dept.id)}
              >
                Hapus
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dept-name-${dept.id}`}>Nama Jurusan</Label>
              <Input
                id={`dept-name-${dept.id}`}
                placeholder="Nama jurusan"
                value={dept.name}
                onChange={(e) =>
                  updateDepartment(dept.id, "name", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dept-desc-${dept.id}`}>Deskripsi</Label>
              <Textarea
                id={`dept-desc-${dept.id}`}
                placeholder="Deskripsi jurusan"
                rows={3}
                value={dept.description}
                onChange={(e) =>
                  updateDepartment(dept.id, "description", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dept-img-${dept.id}`}>URL Gambar</Label>
              <Input
                id={`dept-img-${dept.id}`}
                placeholder="https://example.com/jurusan.jpg"
                value={dept.imageUrl}
                onChange={(e) =>
                  updateDepartment(dept.id, "imageUrl", e.target.value)
                }
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Jurusan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
