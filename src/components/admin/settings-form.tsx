"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Building2, Phone, Share2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploader } from "@/components/admin/image-uploader"
import { updateIdentity, updateContact, updateSocial } from "@/actions/settings"
import type { SiteSettings, SiteIdentity, SiteContact, SiteSocial } from "@/types"

interface SettingsFormProps {
  initialSettings: SiteSettings
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  
  // Identity state
  const [identity, setIdentity] = useState<SiteIdentity>(initialSettings.identity)
  const [identityErrors, setIdentityErrors] = useState<Record<string, string[]>>({})
  
  // Contact state
  const [contact, setContact] = useState<SiteContact>(initialSettings.contact)
  const [contactErrors, setContactErrors] = useState<Record<string, string[]>>({})
  
  // Social state
  const [social, setSocial] = useState<SiteSocial>(initialSettings.social)
  const [socialErrors, setSocialErrors] = useState<Record<string, string[]>>({})

  function handleSaveIdentity() {
    setIdentityErrors({})
    startTransition(async () => {
      const result = await updateIdentity(identity)
      if (!result.success) {
        if (result.fieldErrors) setIdentityErrors(result.fieldErrors)
        toast.error(result.error)
        return
      }
      toast.success("Identitas sekolah berhasil disimpan")
    })
  }

  function handleSaveContact() {
    setContactErrors({})
    startTransition(async () => {
      const result = await updateContact(contact)
      if (!result.success) {
        if (result.fieldErrors) setContactErrors(result.fieldErrors)
        toast.error(result.error)
        return
      }
      toast.success("Informasi kontak berhasil disimpan")
    })
  }

  function handleSaveSocial() {
    setSocialErrors({})
    startTransition(async () => {
      const result = await updateSocial(social)
      if (!result.success) {
        if (result.fieldErrors) setSocialErrors(result.fieldErrors)
        toast.error(result.error)
        return
      }
      toast.success("Media sosial berhasil disimpan")
    })
  }


  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Premium Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-start gap-2 relative overflow-hidden">
        {/* Subtle decorative blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 relative z-10">
          Pengaturan Situs
        </h1>
        <p className="text-slate-500 relative z-10 font-medium">
          Konfigurasi identitas global, informasi kontak, dan media sosial sekolah Anda.
        </p>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/50 flex w-max mx-auto shadow-inner">
          <TabsTrigger value="identity" className="rounded-xl data-[state=active]:bg-[#002244] data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm px-6 py-2.5 transition-all text-slate-500 font-medium">
            <Building2 className="mr-2 h-4 w-4" />
            Identitas
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-[#002244] data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm px-6 py-2.5 transition-all text-slate-500 font-medium">
            <Phone className="mr-2 h-4 w-4" />
            Kontak
          </TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl data-[state=active]:bg-[#002244] data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm px-6 py-2.5 transition-all text-slate-500 font-medium">
            <Share2 className="mr-2 h-4 w-4" />
            Media Sosial
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Identitas ── */}
        <TabsContent value="identity" className="outline-none focus:ring-0">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Informasi Dasar</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-semibold">Nama Sekolah Lengkap</Label>
                <Input
                  id="name"
                  placeholder="SMKN 1 Surabaya"
                  value={identity.name}
                  onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                />
                {identityErrors.name && <p className="text-sm text-destructive font-medium">{identityErrors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortName" className="text-slate-700 font-semibold">Nama Singkat (Sebutan)</Label>
                <Input
                  id="shortName"
                  placeholder="SMKN 1"
                  value={identity.shortName}
                  onChange={(e) => setIdentity({ ...identity, shortName: e.target.value })}
                />
                {identityErrors.shortName && <p className="text-sm text-destructive font-medium">{identityErrors.shortName[0]}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tagline" className="text-slate-700 font-semibold">Tagline Sekolah</Label>
              <Input
                id="tagline"
                placeholder="Berkarakter, Kompeten, Inovatif"
                value={identity.tagline}
                onChange={(e) => setIdentity({ ...identity, tagline: e.target.value })}
              />
              <p className="text-xs text-slate-400 font-medium">Slogan pendek yang tampil berdampingan dengan logo.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-semibold">Deskripsi Publik</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi profil singkat sekolah untuk keperluan metadata..."
                rows={3}
                value={identity.description}
                onChange={(e) => setIdentity({ ...identity, description: e.target.value })}
              />
              <p className="text-xs text-slate-400 font-medium">Teks singkat ini muncul di *footer* web dan deskripsi pencarian Google.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
               <h2 className="text-lg font-bold text-slate-800">Logo Institusi</h2>
               <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl">
                 <ImageUploader
                   onUploadComplete={(url) => setIdentity({ ...identity, logoUrl: url })}
                   currentImageUrl={identity.logoUrl || undefined}
                   maxSizeMB={2}
                   acceptedFormats={["image/png", "image/jpeg", "image/webp"]}
                 />
                 <p className="text-xs text-slate-400 font-medium mt-3 text-center">
                   Rekomendasi: Resolusi tinggi (min 500x500px), format WebP atau PNG transparan.
                 </p>
                 {identityErrors.logoUrl && <p className="text-sm text-destructive font-medium mt-1 text-center">{identityErrors.logoUrl[0]}</p>}
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Favicon</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">Ikon kecil yang tampil di tab browser. Gunakan gambar persegi (1:1).</p>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl">
                <div className="flex items-start gap-6">
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-xl border-2 border-slate-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                      {identity.faviconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={identity.faviconUrl} alt="Favicon preview" className="w-10 h-10 object-contain" />
                      ) : (
                        <span className="text-2xl">🏫</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">Preview</p>
                  </div>
                  <div className="flex-1">
                    <ImageUploader
                      onUploadComplete={(url) => setIdentity({ ...identity, faviconUrl: url })}
                      currentImageUrl={identity.faviconUrl || undefined}
                      maxSizeMB={1}
                      acceptedFormats={["image/png", "image/jpeg", "image/webp"]}
                    />
                    <p className="text-xs text-slate-400 font-medium mt-2">
                      Rekomendasi: PNG persegi, ukuran 32x32px atau 64x64px.
                    </p>
                    {identityErrors.faviconUrl && <p className="text-sm text-destructive font-medium mt-1">{identityErrors.faviconUrl[0]}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={handleSaveIdentity} disabled={isPending} className="bg-[#002244] hover:bg-[#003366] text-white rounded-xl shadow-md transition-all active:scale-95 px-8 font-semibold h-11">
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "Menyimpan..." : "Simpan Perubahan Identitas"}
              </Button>
            </div>
          </div>
        </TabsContent>


        {/* ── Tab: Kontak ── */}
        <TabsContent value="contact" className="outline-none focus:ring-0">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Saluran Kontak Resmi</h2>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="text-slate-700 font-semibold">Alamat Lengkap</Label>
              <Textarea
                id="address"
                placeholder="Jl. SMEA No. 4, Wonokromo, Surabaya"
                rows={2}
                value={contact.address}
                onChange={(e) => setContact({ ...contact, address: e.target.value })}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-semibold">Nomor Telepon</Label>
                <Input
                  id="phone"
                  placeholder="(031) 8881234"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Alamat Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@sekolah.sch.id"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
                {contactErrors.email && <p className="text-sm text-destructive font-medium">{contactErrors.email[0]}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={handleSaveContact} disabled={isPending} className="bg-[#002244] hover:bg-[#003366] text-white rounded-xl shadow-md transition-all active:scale-95 px-8 font-semibold h-11">
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "Menyimpan..." : "Simpan Informasi Kontak"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: Media Sosial ── */}
        <TabsContent value="social" className="outline-none focus:ring-0">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-800">Tautan Media Sosial</h2>
              <p className="text-xs text-slate-400 font-medium">Kosongkan *field* jika Anda tidak ingin menampilkan logo media sosial tersebut di website publik.</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-slate-700 font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                    <Share2 className="h-3 w-3" />
                  </div>
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/sekolah"
                  value={social.instagram}
                  onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                />
                {socialErrors.instagram && <p className="text-sm text-destructive font-medium">{socialErrors.instagram[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="text-slate-700 font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Share2 className="h-3 w-3" />
                  </div>
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  placeholder="https://youtube.com/@sekolah"
                  value={social.youtube}
                  onChange={(e) => setSocial({ ...social, youtube: e.target.value })}
                />
                {socialErrors.youtube && <p className="text-sm text-destructive font-medium">{socialErrors.youtube[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok" className="text-slate-700 font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                    <Share2 className="h-3 w-3" />
                  </div>
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  placeholder="https://tiktok.com/@sekolah"
                  value={social.tiktok}
                  onChange={(e) => setSocial({ ...social, tiktok: e.target.value })}
                />
                {socialErrors.tiktok && <p className="text-sm text-destructive font-medium">{socialErrors.tiktok[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-slate-700 font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Share2 className="h-3 w-3" />
                  </div>
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/sekolah"
                  value={social.facebook}
                  onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                />
                {socialErrors.facebook && <p className="text-sm text-destructive font-medium">{socialErrors.facebook[0]}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={handleSaveSocial} disabled={isPending} className="bg-[#002244] hover:bg-[#003366] text-white rounded-xl shadow-md transition-all active:scale-95 px-8 font-semibold h-11">
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "Menyimpan..." : "Simpan Tautan Sosial"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
