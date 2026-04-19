"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Menu,
  FileText,
  Newspaper,
  Image,
  GraduationCap,
  Users,
  LogOut,
  PanelLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Permission } from "@/lib/rbac"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  permission?: Permission
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Menu", href: "/admin/menu", icon: Menu, permission: "menu:manage" },
  { label: "Konten", href: "/admin/konten", icon: FileText, permission: "content:manage" },
  { label: "Berita", href: "/admin/berita", icon: Newspaper, permission: "article:create" },
  { label: "Galeri", href: "/admin/galeri", icon: Image, permission: "gallery:manage" },
  { label: "Guru", href: "/admin/guru", icon: GraduationCap, permission: "staff:manage" },
  { label: "Pengguna", href: "/admin/pengguna", icon: Users, permission: "user:manage" },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [
    "menu:manage", "content:manage", "article:create", "article:edit",
    "article:publish", "article:delete", "gallery:manage", "staff:manage", "user:manage",
  ],
  EDITOR: [
    "content:manage", "article:create", "article:edit",
    "article:publish", "article:delete", "gallery:manage", "staff:manage",
  ],
  CONTRIBUTOR: ["article:create", "article:edit"],
}

interface AdminSidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getVisibleItems(role: string) {
  const perms = ROLE_PERMISSIONS[role] ?? []
  return NAV_ITEMS.filter((item) => !item.permission || perms.includes(item.permission))
}

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#002244] text-white"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const [open, setOpen] = useState(false)
  const visibleItems = getVisibleItems(user.role)

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    EDITOR: "Editor",
    CONTRIBUTOR: "Kontributor",
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card">
        <div className="flex h-16 items-center gap-2 px-6 border-b">
          <div className="h-8 w-8 rounded-md bg-[#002244] flex items-center justify-center">
            <span className="text-white text-xs font-bold">S1</span>
          </div>
          <span className="font-semibold text-sm">SMKN 1 Surabaya</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <NavLinks items={visibleItems} />
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#002244] text-white text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">{roleLabel[user.role] ?? user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Header (mobile + desktop) */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 lg:pl-[17rem]">
        {/* Mobile menu trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Buka menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="h-16 flex-row items-center gap-2 px-6 border-b space-y-0">
              <div className="h-8 w-8 rounded-md bg-[#002244] flex items-center justify-center">
                <span className="text-white text-xs font-bold">S1</span>
              </div>
              <SheetTitle className="text-sm">SMKN 1 Surabaya</SheetTitle>
            </SheetHeader>
            <div className="px-4 py-4">
              <NavLinks items={visibleItems} onNavigate={() => setOpen(false)} />
            </div>
            <Separator />
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#002244] text-white text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel[user.role] ?? user.role}</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#002244] text-white text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">{roleLabel[user.role] ?? user.role}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // Use signOut from next-auth/react for client-side logout
                import("next-auth/react").then(({ signOut }) =>
                  signOut({ callbackUrl: "/login" })
                )
              }}
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </>
  )
}
