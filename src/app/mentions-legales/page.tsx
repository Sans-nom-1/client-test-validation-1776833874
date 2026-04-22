'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/config'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* iOS Navigation Bar */}
      <header className="ios-navbar sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-accent transition-opacity active:opacity-60"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-[17px]">Retour</span>
          </Link>
          <h1 className="text-[17px] font-semibold text-white">Mentions Légales</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Éditeur */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-label-tertiary mb-3 px-1">
            Éditeur du site
          </h2>
          <div className="ios-card p-4 space-y-2">
            <p className="text-[15px] text-white"><span className="text-label-tertiary">Raison sociale :</span> {SITE_CONFIG.name}</p>
            <p className="text-[15px] text-white"><span className="text-label-tertiary">Forme juridique :</span> Auto-entrepreneur</p>
            <p className="text-[15px] text-white"><span className="text-label-tertiary">Adresse :</span> {SITE_CONFIG.address}</p>
            <p className="text-[15px] text-white"><span className="text-label-tertiary">Email :</span> {SITE_CONFIG.email}</p>
          </div>
        </section>

        {/* Hébergement */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-label-tertiary mb-3 px-1">
            Hébergement
          </h2>
          <div className="ios-card p-4 space-y-2">
            <p className="text-[15px] text-white"><span className="text-label-tertiary">Hébergeur :</span> Vercel Inc.</p>
            <p className="text-[15px] text-white"><span className="text-label-tertiary">Adresse :</span> 340 S Lemon Ave, Walnut, CA 91789, USA</p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-label-tertiary mb-3 px-1">
            Propriété intellectuelle
          </h2>
          <div className="ios-card p-4">
            <p className="text-[15px] text-label-secondary leading-relaxed">
              L&apos;ensemble du contenu de ce site est la propriété exclusive de {SITE_CONFIG.name}.
              Toute reproduction est interdite sans autorisation écrite préalable.
            </p>
          </div>
        </section>

        {/* Données personnelles */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-label-tertiary mb-3 px-1">
            Données personnelles
          </h2>
          <div className="ios-card p-4">
            <p className="text-[15px] text-label-secondary leading-relaxed mb-3">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
              de suppression et de portabilité de vos données.
            </p>
            <Link href="/politique-confidentialite" className="text-[15px] text-accent">
              Voir notre politique de confidentialité
            </Link>
          </div>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-label-tertiary mb-3 px-1">
            Cookies
          </h2>
          <div className="ios-card p-4">
            <p className="text-[15px] text-label-secondary leading-relaxed mb-3">
              Ce site utilise des cookies strictement nécessaires au fonctionnement du service.
            </p>
            <Link href="/politique-cookies" className="text-[15px] text-accent">
              Voir notre politique de cookies
            </Link>
          </div>
        </section>

        {/* Responsabilité */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-label-tertiary mb-3 px-1">
            Limitation de responsabilité
          </h2>
          <div className="ios-card p-4">
            <p className="text-[15px] text-label-secondary leading-relaxed">
              {SITE_CONFIG.name} s&apos;efforce d&apos;assurer l&apos;exactitude des informations
              mais ne peut garantir leur complétude. Nous déclinons toute responsabilité
              pour les dommages résultant de l&apos;utilisation de ce site.
            </p>
          </div>
        </section>

        {/* Droit applicable */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-label-tertiary mb-3 px-1">
            Droit applicable
          </h2>
          <div className="ios-card p-4">
            <p className="text-[15px] text-label-secondary leading-relaxed">
              Les présentes mentions légales sont régies par le droit français.
              En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-label-tertiary mb-3 px-1">
            Contact
          </h2>
          <div className="ios-card p-4">
            <p className="text-[15px] text-label-secondary">
              Pour toute question :{' '}
              <a href={`mailto:${SITE_CONFIG.email}`} className="text-accent">
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
