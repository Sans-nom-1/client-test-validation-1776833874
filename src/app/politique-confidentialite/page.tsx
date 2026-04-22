'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/config'

export default function PolitiqueConfidentialitePage() {
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
          <h1 className="text-[17px] font-semibold text-white">Confidentialité</h1>
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
            1. Introduction
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl p-4">
            <p className="text-[15px] text-white/70 leading-relaxed">
              {SITE_CONFIG.name} s&apos;engage à protéger votre vie privée conformément au RGPD.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            2. Responsable du traitement
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl p-4 space-y-2">
            <p className="text-[15px] text-white font-medium">{SITE_CONFIG.name}</p>
            <p className="text-[15px] text-white/70">{SITE_CONFIG.address}</p>
            <p className="text-[15px] text-[#4CB0F1]">{SITE_CONFIG.email}</p>
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            3. Données collectées
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl overflow-hidden divide-y divide-white/10">
            <div className="p-4">
              <p className="text-[15px] text-white font-medium">Identification</p>
              <p className="text-[13px] text-white/50 mt-1">Nom, prénom, date de naissance</p>
            </div>
            <div className="p-4">
              <p className="text-[15px] text-white font-medium">Contact</p>
              <p className="text-[13px] text-white/50 mt-1">Téléphone, email</p>
            </div>
            <div className="p-4">
              <p className="text-[15px] text-white font-medium">Rendez-vous</p>
              <p className="text-[13px] text-white/50 mt-1">Historique, services, dates</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            4. Finalités
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl overflow-hidden divide-y divide-white/10">
            <div className="p-4">
              <p className="text-[15px] text-white">Gestion des rendez-vous</p>
            </div>
            <div className="p-4">
              <p className="text-[15px] text-white">Rappels SMS (24h avant)</p>
            </div>
            <div className="p-4">
              <p className="text-[15px] text-white">Programme de fidélité</p>
            </div>
            <div className="p-4">
              <p className="text-[15px] text-white">Communications marketing (avec consentement)</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            5. Durée de conservation
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl overflow-hidden divide-y divide-white/10">
            <div className="p-4 flex justify-between">
              <p className="text-[15px] text-white">Données client</p>
              <p className="text-[15px] text-white/50">3 ans</p>
            </div>
            <div className="p-4 flex justify-between">
              <p className="text-[15px] text-white">Historique RDV</p>
              <p className="text-[15px] text-white/50">3 ans</p>
            </div>
            <div className="p-4 flex justify-between">
              <p className="text-[15px] text-white">Logs SMS</p>
              <p className="text-[15px] text-white/50">1 an</p>
            </div>
            <div className="p-4 flex justify-between">
              <p className="text-[15px] text-white">Consentements</p>
              <p className="text-[15px] text-white/50">5 ans</p>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            6. Vos droits
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl overflow-hidden divide-y divide-white/10">
            <div className="p-4">
              <p className="text-[15px] text-white font-medium">Accès</p>
              <p className="text-[13px] text-white/50 mt-1">Obtenir une copie de vos données</p>
            </div>
            <div className="p-4">
              <p className="text-[15px] text-white font-medium">Rectification</p>
              <p className="text-[13px] text-white/50 mt-1">Corriger des données inexactes</p>
            </div>
            <div className="p-4">
              <p className="text-[15px] text-white font-medium">Effacement</p>
              <p className="text-[13px] text-white/50 mt-1">Demander la suppression</p>
            </div>
            <div className="p-4">
              <p className="text-[15px] text-white font-medium">Portabilité</p>
              <p className="text-[13px] text-white/50 mt-1">Recevoir vos données en format standard</p>
            </div>
          </div>
          <div className="mt-3 bg-[#1c1c1e] rounded-xl p-4">
            <p className="text-[15px] text-white/70">
              Pour exercer ces droits :{' '}
              <Link href="/account/privacy" className="text-[#4CB0F1]">Mon espace &gt; Confidentialité</Link>
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            7. Sécurité
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl p-4">
            <p className="text-[15px] text-white/70 leading-relaxed">
              Chiffrement des mots de passe, connexions HTTPS, accès restreint aux données, authentification sécurisée.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            8. Réclamation
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl p-4">
            <p className="text-[15px] text-white/70 leading-relaxed">
              Vous pouvez déposer une réclamation auprès de la CNIL :{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#4CB0F1]">
                www.cnil.fr
              </a>
            </p>
          </div>
        </section>

        {/* Liens */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
            Documents associés
          </h2>
          <div className="bg-[#1c1c1e] rounded-xl overflow-hidden divide-y divide-white/10">
            <Link href="/politique-cookies" className="p-4 flex justify-between items-center active:bg-white/5">
              <p className="text-[15px] text-white">Politique de cookies</p>
              <ChevronLeft className="w-4 h-4 text-white/30 rotate-180" />
            </Link>
            <Link href="/mentions-legales" className="p-4 flex justify-between items-center active:bg-white/5">
              <p className="text-[15px] text-white">Mentions légales</p>
              <ChevronLeft className="w-4 h-4 text-white/30 rotate-180" />
            </Link>
          </div>
        </section>

        <div className="h-8" />
      </main>
    </div>
  )
}
