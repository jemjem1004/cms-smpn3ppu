"use client"

import { useState } from "react"
import { MessageCircle, Send, User, ChevronDown, AlignLeft, AlertCircle } from "lucide-react"

const CATEGORIES = [
  "Pertanyaan Umum",
  "Informasi Pendaftaran",
  "Pengaduan Fasilitas",
  "Pengaduan Pelayanan",
  "Saran & Masukan",
  "Lainnya",
]

interface KontakFormProps {
  whatsappNumber: string
  schoolName: string
}

export function KontakForm({ whatsappNumber, schoolName }: KontakFormProps) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Nama wajib diisi"
    if (!form.category) e.category = "Pilih kategori"
    if (!form.message.trim()) e.message = "Pesan wajib diisi"
    else if (form.message.trim().length < 10) e.message = "Pesan terlalu singkat"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    if (!whatsappNumber) {
      alert("Nomor WhatsApp belum dikonfigurasi. Hubungi administrator.")
      return
    }

    const text = [
      `*Kontak & Pengaduan - ${schoolName}*`,
      ``,
      `*Nama:* ${form.name}`,
      `*Kategori:* ${form.category}`,
      ``,
      `*Pesan:*`,
      form.message,
    ].join("\n")

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/60 p-6 md:p-10 relative overflow-hidden group">
      {/* Decorative Blur Background inside form */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#002244]/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-10 relative z-10">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#002244] to-[#003366] flex items-center justify-center shadow-lg shadow-blue-900/10">
          <MessageCircle className="h-6 w-6 text-[#FFC107]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#002244]">Kirim Pengaduan</h2>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Respons Cepat via WhatsApp</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* Nama */}
        <div className="space-y-2 group/input">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#002244]/70 ml-1">
            <User className="h-3 w-3 text-[#FFC107]" />
            Nama Lengkap
          </label>
          <input
            type="text"
            placeholder="Masukkan nama Anda"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3.5 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#002244]/5 focus:border-[#002244] focus:bg-white transition-all duration-300"
          />
          {errors.name && (
            <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold uppercase tracking-tighter ml-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </div>
          )}
        </div>

        {/* Kategori */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#002244]/70 ml-1">
            <ChevronDown className="h-3 w-3 text-[#FFC107]" />
            Kategori Pesan
          </label>
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#002244]/5 focus:border-[#002244] focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="" disabled className="text-slate-300">Pilih kategori layanan...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          {errors.category && (
            <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold uppercase tracking-tighter ml-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.category}
            </div>
          )}
        </div>

        {/* Pesan */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#002244]/70 ml-1">
            <AlignLeft className="h-3 w-3 text-[#FFC107]" />
            Isi Pesan
          </label>
          <textarea
            placeholder="Tuliskan pertanyaan, saran, atau pengaduan Anda di sini..."
            rows={5}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3.5 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#002244]/5 focus:border-[#002244] focus:bg-white transition-all duration-300 resize-none min-h-[160px]"
          />
          <div className="flex justify-between items-center px-1">
            {errors.message ? (
              <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold uppercase tracking-tighter">
                <AlertCircle className="h-3 w-3" />
                {errors.message}
              </div>
            ) : <span />}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{form.message.length} Karakter</p>
          </div>
        </div>

        {/* Info WhatsApp Non-Config */}
        {!whatsappNumber && (
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
              Nomor WhatsApp tujuan belum diatur. Silakan hubungi admin untuk melakukan konfigurasi nomor handphone sekolah.
            </p>
          </div>
        )}

        {/* Submit Premium Button */}
        <button
          type="submit"
          disabled={!whatsappNumber}
          className="w-full relative group/btn overflow-hidden rounded-2xl bg-[#002244] p-[1px] disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-2xl transition-all duration-500"
        >
          <div className="h-14 flex items-center justify-center gap-3 bg-[#002244] rounded-[15px] group-hover/btn:bg-transparent transition-all duration-500 text-white font-bold text-sm">
            <Send className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            <span>Kirim via WhatsApp</span>
          </div>
          {/* Subtle Hover Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 -z-10" />
        </button>

        <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-[0.1em] px-4">
          Data Anda aman. Tombol ini akan mengarahkan pesan Anda langsung ke aplikasi WhatsApp sekolah kami.
        </p>
      </form>
    </div>
  )
}
