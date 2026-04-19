import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { getPublicMenuItems, getSiteSettings } from "@/lib/queries"
import { MobileMenuToggle } from "./mobile-menu-toggle"

export async function Navbar() {
  const [items, settings] = await Promise.all([
    getPublicMenuItems(),
    getSiteSettings(),
  ])

  const { identity } = settings

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {identity.logoUrl ? (
              <Image
                src={identity.logoUrl}
                alt={identity.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md transform group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white shadow-md shrink-0 transform group-hover:scale-105 transition-transform duration-300">
                <span className="text-[#002244] font-extrabold text-[9px] text-center leading-tight">
                  {identity.shortName.split(" ").map(w => w[0]).join("").slice(0, 4)}
                </span>
              </div>
            )}
            <div className="leading-none">
              <h1 className="font-extrabold text-xl text-[#002244] tracking-tight">{identity.shortName}</h1>
              {identity.tagline && (
                <p className="text-[9px] tracking-widest text-red-600 font-bold uppercase mt-1">{identity.tagline}</p>
              )}
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
                      </button>                      <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                        <ul className="bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] min-w-[220px] py-2.5 transform origin-top-left animate-in fade-in slide-in-from-top-2 duration-200">
                          {item.children.map((child) => (
                             <li key={child.id}>
                              <Link
                                href={child.url}
                                className="block px-5 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-medium transition-colors"
                                target={child.type === "EXTERNAL" ? "_blank" : undefined}
                                rel={child.type === "EXTERNAL" ? "noopener noreferrer" : undefined}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    item.url === "#" ? (
                      <button
                        className="block px-3 py-2 text-[0.85rem] font-semibold text-slate-600 cursor-default"
                      >
                        {item.label}
                      </button>
                    ) : (
                    <Link
                      href={item.url}
                      className="block px-3 py-2 text-[0.85rem] font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                      target={item.type === "EXTERNAL" ? "_blank" : undefined}
                      rel={item.type === "EXTERNAL" ? "noopener noreferrer" : undefined}
                    >
                      {item.label}
                    </Link>
                    )
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile menu toggle */}
          <MobileMenuToggle items={items} identity={identity} />
        </div>
      </div>
    </header>
  )
}
