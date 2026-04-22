'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/config'

export default function PolitiqueCookiesPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* iOS Navigation Bar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-[#4CB0F1] transition-opacity active:opacity-60"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-[17px]">Retour</span>
          </Link>
          <h1 className="text-[17px] font-semibold text-white">Cookies</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <p className="text-[13px] text-white/50 px-1">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Section 1 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            1. Qu&apos;est-ce qu&apos;un cookie ?
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl p-4">
            <p className="text-[15px] text-white/70 leading-relaxed">
              Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web.
              Les cookies permettent au site de mémoriser vos actions et préférences.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            2. Cookies utilisés
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl overflow-hidden divide-y divide-white/10">
            <div className="p-4">
              <p className="text-[15px] text-white font-medium">session</p>
              <p className="text-[13px] text-white/50 mt-1">Authentification • 7 jours</p>
            </div>
            <div className="p-4">
              <p className="text-[15px] text-white font-medium">cookie_consent</p>
              <p className="text-[13px] text-white/50 mt-1">Préférences cookies • 1 an</p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            3. Cookies tiers
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl p-4">
            <p className="text-[15px] text-white/70 leading-relaxed">
              Nous n&apos;utilisons <span className="text-white font-medium">aucun cookie tiers</span> à des fins
              de suivi, de publicité ou d&apos;analyse.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            4. Gestion des cookies
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl p-4 space-y-3">
            <p className="text-[15px] text-white/70 leading-relaxed">
              Vous pouvez gérer vos préférences cookies via votre navigateur ou en vous déconnectant.
            </p>
            <div className="space-y-2">
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="block text-[15px] text-[#4CB0F1]">
                Google Chrome
              </a>
              <a href="https://support.mozilla.org/fr/kb/effacer-cookies-donnees-sites-firefox" target="_blank" rel="noopener noreferrer" className="block text-[15px] text-[#4CB0F1]">
                Mozilla Firefox
              </a>
              <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="block text-[15px] text-[#4CB0F1]">
                Safari
              </a>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            5. Conséquences du refus
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl p-4">
            <p className="text-[15px] text-white/70 leading-relaxed">
              Si vous refusez les cookies nécessaires, vous ne pourrez pas vous connecter à votre compte
              et certaines fonctionnalités seront limitées.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            Contact
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl p-4">
            <p className="text-[15px] text-white/70">
              Pour toute question :{' '}
              <a href={`mailto:${SITE_CONFIG.email}`} className="text-[#4CB0F1]">
                {SITE_CONFIG.email}
              </a>
            </p>
          </div>
        </section>

        <div className="h-8" />
      </main>
    </div>
  )
}
