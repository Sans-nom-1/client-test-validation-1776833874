'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_CONFIG } from '@/lib/config'

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/services', label: 'Services' },
  { href: '/horaires', label: 'Horaires' },
  { href: '/contact', label: 'Contact' },
]

export function SiteNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      className="sticky top-0 z-50"
      style={{ backgroundColor: 'var(--ios-base)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="mx-auto max-w-[1100px] px-5 flex items-center justify-between h-16">
        {/* Logo / Site name */}
        <Link
          href="/"
          className="font-black text-lg tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {SITE_CONFIG.name}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  color: active ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  fontWeight: active ? 700 : 400,
                }}
              >
                {l.label}
              </Link>
            )
          })}
          <Link
            href="/booking"
            className="ml-3 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-85"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            Réserver
          </Link>
        </div>

        {/* Mobile: Réserver + burger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/booking"
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            Réserver
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="12" x2="17" y2="12"/><line x1="3" y1="18" x2="17" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-5 pb-4 flex flex-col gap-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'var(--ios-elevated)' }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm"
              style={{ color: pathname === l.href ? 'var(--accent)' : 'rgba(255,255,255,0.7)' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
