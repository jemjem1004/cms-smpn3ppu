import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { getPublicMenuItems } from "@/lib/queries"
import { MobileMenuToggle } from "./mobile-menu-toggle"

export async function Navbar() {
  const items = await getPublicMenuItems()

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="flex items-center justify-center h-10 w-10 border border-[#FFC107]/30 rounded-full bg-[#FFC107]/10 text-[#FFC107] font-bold text-sm group-hover:bg-[#FFC107] group-hover:text-[#0f172a] transition-all duration-300 shadow-[0_0_15px_rgba(255,193,7,0.15)] group-hover:shadow-[0_0_20px_rgba(255,193,7,0.4)]">
              S1
            </div>
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-lg tracking-tight leading-none group-hover:text-blue-100 transition-colors">
                SMKN 1 <span className="text-[#FFC107]">Surabaya</span>
              </span>
              <span className="text-[0.65rem] text-slate-400 font-medium tracking-widest uppercase mt-0.5">
                Portal Resmi
              </span>
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
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-all rounded-lg"
                        aria-haspopup="true"
                      >
                        {item.label}
                        <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <ul className="absolute left-0 top-full mt-2 hidden group-hover:block bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl min-w-[220px] py-2 z-50 backdrop-blur-xl ring-1 ring-black/5 transform origin-top-left transition-all">
                        {item.children.map((child) => (
                           <li key={child.id}>
                            <Link
                              href={child.url}
                              className="block px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-blue-600/10 transition-colors"
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
                      className="block px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-all rounded-lg"
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
