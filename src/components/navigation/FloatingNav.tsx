'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, User, Calendar, MapPin, Clock, Instagram, ChevronRight, Star } from 'lucide-react'
import { getFormattedHours } from '@/lib/business-hours'
import { SITE_CONFIG, NAV_LINKS } from '@/lib/config'

const contactInfo = [
  ...(SITE_CONFIG.instagram && SITE_CONFIG.instagramHandle
    ? [{ icon: <Instagram className="w-4 h-4" />, label: SITE_CONFIG.instagramHandle, href: SITE_CONFIG.instagram }]
    : []),
  { icon: <MapPin className="w-4 h-4" />, label: SITE_CONFIG.location, href: SITE_CONFIG.mapsUrl },
  { icon: <Clock className="w-4 h-4" />, label: getFormattedHours(), href: '#' },
]

export default function FloatingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <>
      {/* Floating Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 header-safe ${
          isScrolled ? 'bg-black/90 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - Rond noir comme les autres boutons */}
            <Link
              href="/"
              className="flex-shrink-0 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-black overflow-hidden"
              aria-label="Accueil"
            >
              <Image
                src="/images/logo-transparent.png"
                alt={SITE_CONFIG.name}
                width={44}
                height={44}
                className="w-8 h-8 object-contain"
                priority
              />
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Quick Book CTA - Desktop (rounded like other buttons) */}
              <Link
                href="/#booking"
                className="hidden sm:flex w-11 h-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
                title="Réserver"
              >
                <Calendar className="w-5 h-5" />
              </Link>

              {/* Account Button */}
              <Link
                href="/account"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Avis Button */}
              <Link
                href="/avis"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
                title="Avis clients"
              >
                <Star className="w-5 h-5" />
              </Link>

              {/* Menu Burger */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all z-50"
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col h-full pt-24 pb-safe px-6">
          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col justify-center" aria-label="Menu principal">
            <ul className="space-y-2">
              {NAV_LINKS.map((link, index) => (
                <li
                  key={link.href}
                  className={`transform transition-all duration-500 ${
                    isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between py-4 text-[32px] font-bold text-white hover:text-accent transition-colors group"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-accent group-hover:translate-x-1 transition-all" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA Button in Menu */}
            <div
              className={`mt-8 transform transition-all duration-500 ${
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <Link
                href="/#booking"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-3 w-full py-4 bg-accent text-black rounded-2xl font-bold text-[18px] hover:bg-accent-hover active:scale-[0.98] transition-all"
              >
                <Calendar className="w-5 h-5" />
                <span>Réserver maintenant</span>
              </Link>
            </div>
          </nav>

          {/* Contact Info */}
          <div
            className={`border-t border-white/10 pt-6 transform transition-all duration-500 ${
              isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <address className="space-y-3 not-italic">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.href}
                  target={info.href.startsWith('http') ? '_blank' : undefined}
                  rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
                >
                  <span aria-hidden="true">{info.icon}</span>
                  <span className="text-[15px]">{info.label}</span>
                </a>
              ))}
            </address>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href={SITE_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-accent hover:text-black transition-all"
                aria-label="Suivez-nous sur Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
