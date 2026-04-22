'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Shield,
  Download,
  Bell,
  AlertTriangle,
  Check,
  Loader2,
  ChevronRight,
  Lock,
  FileText,
  Trash2,
} from 'lucide-react'

interface ConsentData {
  consents: {
    marketing: boolean
    smsReminders: boolean
  }
  history: Array<{
    type: string
    value: boolean
    source: string
    createdAt: string
  }>
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [consentData, setConsentData] = useState<ConsentData | null>(null)
  const [marketingConsent, setMarketingConsent] = useState(false)

  useEffect(() => {
    fetchConsents()
  }, [])

  const fetchConsents = async () => {
    try {
      const res = await fetch('/api/auth/customer/consent')
      if (res.status === 401) {
        router.push('/account')
        return
      }
      if (!res.ok) throw new Error('Erreur de chargement')
      const data = await res.json()
      setConsentData(data)
      setMarketingConsent(data.consents.marketing)
    } catch {
      setError('Erreur lors du chargement des préférences')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConsents = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/customer/consent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketing: marketingConsent }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de sauvegarde')
      }

      setSuccess('Préférences mises à jour')
      fetchConsents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    setExporting(true)
    setError('')

    try {
      const res = await fetch('/api/auth/customer/export')
      if (!res.ok) throw new Error('Erreur lors de l\'export')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mes-donnees-levelup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccess('Export téléchargé avec succès')
    } catch {
      setError('Erreur lors de l\'export des données')
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setError('')

    try {
      const res = await fetch('/api/auth/customer/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      router.push('/?deleted=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header iOS */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/account/profile" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Paramètres du compte</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 text-red-400 text-[13px]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/20 text-green-400 text-[13px] flex items-center gap-2">
            <Check className="w-4 h-4" />
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Notifications */}
          <section>
            <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
              Notifications
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-[15px] text-white font-medium">Rappels SMS</p>
                    <p className="text-[13px] text-white/50">24h avant le rendez-vous</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[12px] rounded-full font-medium">
                  Actif
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[15px] text-white font-medium">Marketing</p>
                    <p className="text-[13px] text-white/50">Offres et promotions</p>
                  </div>
                </div>
                <button
                  onClick={() => setMarketingConsent(!marketingConsent)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    marketingConsent ? 'bg-white' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full transition-all ${
                      marketingConsent ? 'bg-black left-6' : 'bg-white left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {marketingConsent !== consentData?.consents.marketing && (
              <button
                onClick={handleSaveConsents}
                disabled={saving}
                className="w-full mt-3 py-4 bg-[#4CB0F1] rounded-2xl text-[15px] font-semibold text-black shadow-lg shadow-[#4CB0F1]/20 disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            )}
          </section>

          {/* Confidentialité & Données */}
          <section>
            <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
              Confidentialité & données
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="w-full p-4 flex items-center justify-between active:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] text-white font-medium">Exporter mes données</p>
                    <p className="text-[13px] text-white/50">Format JSON (RGPD)</p>
                  </div>
                </div>
                {exporting ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-white/30" />
                )}
              </button>

              <Link href="/forgot-password" className="p-4 flex items-center justify-between active:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-[15px] text-white font-medium">Changer le mot de passe</p>
                    <p className="text-[13px] text-white/50">Sécurisez votre compte</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </Link>
            </div>
          </section>

          {/* Documents légaux */}
          <section>
            <h2 className="text-[13px] font-medium uppercase tracking-wide text-white/50 mb-3 px-1">
              Informations légales
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
              <Link href="/politique-confidentialite" className="p-4 flex items-center justify-between active:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white/60" />
                  </div>
                  <span className="text-[15px] text-white">Politique de confidentialité</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </Link>
              <Link href="/politique-cookies" className="p-4 flex items-center justify-between active:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white/60" />
                  </div>
                  <span className="text-[15px] text-white">Politique de cookies</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </Link>
              <Link href="/mentions-legales" className="p-4 flex items-center justify-between active:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white/60" />
                  </div>
                  <span className="text-[15px] text-white">Mentions légales</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </Link>
            </div>
          </section>

          {/* Zone de danger */}
          <section>
            <h2 className="text-[13px] font-medium uppercase tracking-wide text-red-400/70 mb-3 px-1">
              Zone de danger
            </h2>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full p-4 flex items-center justify-between active:bg-red-500/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] text-red-400 font-medium">Supprimer mon compte</p>
                    <p className="text-[13px] text-white/50">Action irréversible</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400/50" />
              </button>
            </div>
          </section>
        </div>

        <div className="h-8" />

        {/* Modal de suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-black border-t border-white/10 rounded-t-3xl p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-[17px] font-semibold text-white">Confirmer la suppression</h3>
              </div>

              <p className="text-[14px] text-white/60 mb-6">
                Attention ! Cette action est définitive. Toutes vos données seront supprimées.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[13px] text-white/50 mb-2">
                    Votre mot de passe
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-[13px] text-white/50 mb-2">
                    Écrivez &quot;SUPPRIMER MON COMPTE&quot;
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="SUPPRIMER MON COMPTE"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletePassword('')
                    setDeleteConfirmation('')
                    setError('')
                  }}
                  className="flex-1 py-4 rounded-2xl text-[15px] font-medium text-white bg-white/10"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmation !== 'SUPPRIMER MON COMPTE' || !deletePassword}
                  className="flex-1 py-4 rounded-2xl text-[15px] font-medium text-white bg-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
