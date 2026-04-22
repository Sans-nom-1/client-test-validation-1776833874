'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Instagram } from 'lucide-react'
import { getOpenStatus, getFormattedHours, type OpenStatus } from '@/lib/business-hours'
import { SITE_CONFIG, LEGAL_LINKS } from '@/lib/config'

const contactInfo = [
  ...(SITE_CONFIG.instagram && SITE_CONFIG.instagramHandle
    ? [{ icon: <Instagram className="w-4 h-4" />, label: SITE_CONFIG.instagramHandle, href: SITE_CONFIG.instagram }]
    : []),
  { icon: <MapPin className="w-4 h-4" />, label: SITE_CONFIG.location, href: SITE_CONFIG.mapsUrl },
  { icon: <Clock className="w-4 h-4" />, label: getFormattedHours(), href: '#' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [status, setStatus] = useState<OpenStatus>({ isOpen: true, message: 'Ouvert maintenant' })

  useEffect(() => {
    // Check status on mount and every minute
    const checkStatus = () => setStatus(getOpenStatus())
    checkStatus()
    const interval = setInterval(checkStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="mb-4" aria-label="Retour a l'accueil">
              <Image
                src="/images/logo-transparent.png"
                alt={SITE_CONFIG.name}
                width={120}
                height={120}
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-[14px] text-white/70 text-center md:text-left max-w-xs">
              {SITE_CONFIG.slogan}
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={SITE_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-accent hover:text-black transition-all"
                aria-label="Suivez-nous sur Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-[15px] font-semibold text-white mb-4">Contact</h3>

            {/* Status Badge */}
            <div className="mb-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium ${
                status.isOpen
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {status.message}
              </div>
            </div>

            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 text-[14px] text-white/70 hover:text-white transition-colors"
                  >
                    <span className="text-accent" aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <nav className="flex flex-col items-center md:items-start" aria-label="Liens legaux">
            <h3 className="text-[15px] font-semibold text-white mb-4">Informations</h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/5">
          <p className="text-[12px] text-white/30 text-center">
            © {currentYear} {SITE_CONFIG.name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
