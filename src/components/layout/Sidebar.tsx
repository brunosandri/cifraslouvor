'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Music2, Library, PenSquare, Settings, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/library', label: 'Biblioteca', icon: Library },
  { href: '/songs', label: 'Editor de Cifras', icon: PenSquare },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
          <Music2 size={16} className="text-gray-950" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-100 truncate">CifrasLouvor</p>
          <p className="text-xs text-gray-500 truncate">Ministério de Louvor</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-amber-500/10 text-amber-400'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
          )}
        >
          <Settings size={18} />
          Configurações
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-gray-950 border-r border-gray-800 h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 h-14 bg-gray-950 border-b border-gray-800">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center">
            <Music2 size={12} className="text-gray-950" />
          </div>
          <span className="text-sm font-bold text-gray-100">CifrasLouvor</span>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-gray-950 border-r border-gray-800 h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </Button>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
