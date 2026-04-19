import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { getPublicMenuItems } from "@/lib/queries"
import { MobileMenuToggle } from "./mobile-menu-toggle"

export async function Navbar() {
  const items = await getPublicMenuItems()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo Sesuai Referensi */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white shadow-md shrink-0 transform group-hover:scale-105 transition-transform duration-300">
              <span className="text-[#002244] font-extrabold text-[9px] text-center leading-tight">
                SMK<br />N1
              </span>
            </div>
            <div className="leading-none">
              <h1 className="font-extrabold text-xl text-[#002244] tracking-tight">SMKN 1</h1>
              <p className="text-[9px] tracking-widest text-red-600 font-bold uppercase mt-1">Surabaya</p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:block" aria-label="Menu navigasi utama">
            <ul className="flex items-center gap-2">
              {items.map((item) => (
                <li key={item.id} className="relative group">
                  {item.children.length > 0 ? (
                    <>
                      <button
                        className="flex items-center gap-1.5 px-3 py-2 text-[0.85rem] font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                        aria-haspopup="true"
                      >
                        {item.label}
                        <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
                      </button>
                      <ul className="absolute left-0 top-full mt-2 hidden group-hover:block bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] min-w-[220px] py-2 z-50 transform origin-top-left transition-all">
                        {item.children.map((child) => (
                           <li key={child.id}>
                            <Link
                              href={child.url}
                              className="block px-5 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-medium transition-colors"
                              target={child.type === "EXTERNAL" ? "_blank" : undefined}
                              rel={child.type === "EXTERNAL" ? "noopener noreferrer" : undefined}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={item.url}
                      className="block px-3 py-2 text-[0.85rem] font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                      target={item.type === "EXTERNAL" ? "_blank" : undefined}
                      rel={item.type === "EXTERNAL" ? "noopener noreferrer" : undefined}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile menu toggle */}
          <MobileMenuToggle items={items} />
        </div>
      </div>
    </header>
  )
}
