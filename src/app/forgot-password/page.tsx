'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'verify' | 'reset' | 'success'>('phone')
  const [loading, setLoading] = useState(false)

  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!phone.trim()) {
      setError('Veuillez entrer votre numéro de téléphone')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'PASSWORD_RESET' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur')

      setStep('verify')
      setCountdown(60)
      setSuccess(`Code envoyé !${data.code ? ' (' + data.code + ')' : ''}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Code à 6 chiffres requis')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: verificationCode, type: 'PASSWORD_RESET' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Code invalide')

      setStep('reset')
      setSuccess('Code vérifié !')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newPassword || newPassword.length < 8) {
      setError('Mot de passe min. 8 caractères')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: verificationCode, newPassword }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur')

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
  const btnClass = "w-full py-4 bg-[#4CB0F1] rounded-2xl text-[15px] font-semibold text-black shadow-lg shadow-[#4CB0F1]/20 disabled:opacity-50 active:scale-[0.98] transition-all"

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/account" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Mot de passe oublié</span>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[14px]">
            {error}
          </div>
        )}
        {success && !error && (
          <div className="mb-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-[14px]">
            {success}
          </div>
        )}

        {/* Étape 1 : Téléphone */}
        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <h1 className="text-[24px] font-semibold text-white mb-1">Réinitialiser</h1>
            <p className="text-[14px] text-white/60 mb-6">
              Entrez le numéro de téléphone associé à votre compte
            </p>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Téléphone"
              className={inputClass}
              autoComplete="tel"
            />

            <div className="pt-4 space-y-3">
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </button>
              <Link href="/account">
                <button type="button" className="w-full py-3 text-[15px] text-white/60 text-center">
                  Retour
                </button>
              </Link>
            </div>
          </form>
        )}

        {/* Étape 2 : Vérification */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <h1 className="text-[24px] font-semibold text-white mb-1">Vérification</h1>
            <p className="text-[14px] text-white/60 mb-6">
              Un code a été envoyé au <span className="text-white">{phone}</span>
            </p>

            <input
              type="text"
              inputMode="numeric"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Code à 6 chiffres"
              maxLength={6}
              className={`${inputClass} text-center tracking-widest`}
            />

            <div className="pt-4 space-y-3">
              <button type="submit" disabled={loading || verificationCode.length !== 6} className={btnClass}>
                {loading ? 'Vérification...' : 'Vérifier'}
              </button>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className="w-full py-3 text-[15px] text-[#4CB0F1] disabled:text-white/40"
              >
                {countdown > 0 ? `Renvoyer (${countdown}s)` : 'Renvoyer le code'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setVerificationCode(''); setError('') }}
                className="w-full py-3 text-[15px] text-white/60"
              >
                Changer de numéro
              </button>
            </div>
          </form>
        )}

        {/* Étape 3 : Nouveau mot de passe */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h1 className="text-[24px] font-semibold text-white mb-1">Nouveau mot de passe</h1>
            <p className="text-[14px] text-white/60 mb-6">
              Choisissez un nouveau mot de passe
            </p>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe (min. 8 caractères)"
              className={inputClass}
              autoComplete="new-password"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
              className={inputClass}
              autoComplete="new-password"
            />

            <div className="pt-4">
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? 'Réinitialisation...' : 'Réinitialiser'}
              </button>
            </div>
          </form>
        )}

        {/* Étape 4 : Succès */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-[24px] font-semibold text-white mb-2">Mot de passe réinitialisé</h1>
            <p className="text-[14px] text-white/60 mb-8">
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe
            </p>
            <button onClick={() => router.push('/account')} className={btnClass}>
              Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
