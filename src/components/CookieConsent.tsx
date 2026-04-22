'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'cookie_consent'
const COOKIE_CONSENT_VERSION = '1.0'

interface CookiePreferences {
  version: string
  necessary: boolean // Toujours true
  accepted: boolean
  timestamp: string
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (stored) {
      try {
        const preferences: CookiePreferences = JSON.parse(stored)
        // Afficher la bannière si la version a changé
        if (preferences.version !== COOKIE_CONSENT_VERSION) {
          setShowBanner(true)
        }
      } catch {
        setShowBanner(true)
      }
    } else {
      setShowBanner(true)
    }
    setIsLoaded(true)
  }, [])

  const savePreferences = (accepted: boolean) => {
    const preferences: CookiePreferences = {
      version: COOKIE_CONSENT_VERSION,
      necessary: true,
      accepted,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences))
    setShowBanner(false)
  }

  const handleAccept = () => {
    savePreferences(true)
  }

  const handleRefuse = () => {
    // Note: Les cookies nécessaires sont toujours actifs
    savePreferences(false)
  }

  // Ne pas afficher pendant le chargement pour éviter le flash
  if (!isLoaded || !showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
            <Cookie className="w-5 h-5 text-zinc-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold mb-1">Ce site utilise des cookies</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Nous utilisons uniquement des cookies <strong className="text-zinc-300">strictement nécessaires</strong> au
              fonctionnement du site (authentification). Aucun cookie de suivi ou publicitaire.{' '}
              <Link href="/politique-cookies" className="text-white underline hover:text-zinc-300">
                En savoir plus
              </Link>
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
              >
                J&apos;accepte
              </button>
              <button
                onClick={handleRefuse}
                className="px-4 py-2 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cookies essentiels uniquement
              </button>
            </div>
          </div>

          <button
            onClick={handleRefuse}
            className="flex-shrink-0 p-2 text-zinc-500 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap gap-4 text-xs text-zinc-500">
          <Link href="/politique-confidentialite" className="hover:text-zinc-300 transition-colors">
            Politique de confidentialité
          </Link>
          <Link href="/mentions-legales" className="hover:text-zinc-300 transition-colors">
            Mentions légales
          </Link>
          <Link href="/politique-cookies" className="hover:text-zinc-300 transition-colors">
            Politique de cookies
          </Link>
        </div>
      </div>
    </div>
  )
}
