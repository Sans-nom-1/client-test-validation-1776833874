'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

type TabType = 'login' | 'register'

export default function AccountPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('login')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [loginData, setLoginData] = useState({ identifier: '', password: '' })
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  })

  const [smsVerification, setSmsVerification] = useState({
    codeSent: false,
    codeVerified: false,
    sending: false,
    verifying: false,
    countdown: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/customer/me')
        if (response.ok) {
          const data = await response.json()
          router.push(data.role === 'ADMIN' ? '/admin' : '/account/profile')
        }
      } catch {
        console.log('Not logged in')
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (smsVerification.countdown > 0) {
      const timer = setTimeout(() => {
        setSmsVerification(prev => ({ ...prev, countdown: prev.countdown - 1 }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [smsVerification.countdown])

  const formatDateOfBirth = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 8)
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`
  }

  const handleSendVerificationCode = async () => {
    if (!registerData.phone.trim()) {
      setErrors({ phone: 'Numéro requis' })
      return
    }
    setSmsVerification(prev => ({ ...prev, sending: true }))
    setErrors({})

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: registerData.phone, type: 'PHONE_VERIFICATION' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur')

      setSmsVerification(prev => ({ ...prev, codeSent: true, sending: false, countdown: 60 }))
      setErrors({ general: `Code envoyé !${data.code ? ' (' + data.code + ')' : ''}` })
    } catch (error) {
      setSmsVerification(prev => ({ ...prev, sending: false }))
      setErrors({ general: error instanceof Error ? error.message : 'Erreur' })
    }
  }

  const handleVerifyCode = async () => {
    if (!registerData.verificationCode.trim()) {
      setErrors({ verificationCode: 'Code requis' })
      return
    }
    setSmsVerification(prev => ({ ...prev, verifying: true }))
    setErrors({})

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: registerData.phone,
          code: registerData.verificationCode,
          type: 'PHONE_VERIFICATION',
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Code invalide')

      setSmsVerification(prev => ({ ...prev, codeVerified: true, verifying: false }))
      setErrors({ general: 'Numéro vérifié !' })
    } catch (error) {
      setSmsVerification(prev => ({ ...prev, verifying: false }))
      setErrors({ general: error instanceof Error ? error.message : 'Erreur' })
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!loginData.identifier.trim() || !loginData.password) {
      setErrors({ general: 'Email/téléphone et mot de passe requis' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginData.identifier, password: loginData.password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur')

      // Redirection admin ou client
      if (data.redirectTo) {
        router.push(data.redirectTo)
      } else {
        router.push(data.role === 'ADMIN' ? '/admin' : '/account/profile')
      }
      router.refresh()
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Erreur' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!registerData.firstName.trim()) newErrors.firstName = 'Requis'
    if (!registerData.lastName.trim()) newErrors.lastName = 'Requis'
    if (!registerData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) newErrors.email = 'Email invalide'
    if (!registerData.phone.trim()) newErrors.phone = 'Requis'
    if (!registerData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Requis'
    if (!registerData.password || registerData.password.length < 8) newErrors.password = 'Min. 8 caractères'
    if (registerData.password !== registerData.confirmPassword) newErrors.confirmPassword = 'Non identiques'
    if (!smsVerification.codeVerified) newErrors.verificationCode = 'Vérifiez votre numéro'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const [day, month, year] = registerData.dateOfBirth.split('/')
      const response = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email.trim().toLowerCase(),
          phone: registerData.phone,
          dateOfBirth: `${year}-${month}-${day}`,
          password: registerData.password,
          verificationCode: registerData.verificationCode,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur')

      router.push('/account/profile')
      router.refresh()
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Erreur' })
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4CB0F1] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 header-safe">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Mon compte</span>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <h1 className="text-[28px] font-bold text-white mb-2">Bienvenue</h1>
        <p className="text-[15px] text-white/50 mb-8">Connectez-vous ou créez un compte</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-2xl">
          <button
            onClick={() => { setActiveTab('login'); setErrors({}) }}
            className={`flex-1 py-3 rounded-xl text-[15px] font-medium transition-all ${
              activeTab === 'login' ? 'bg-[#4CB0F1] text-black shadow-lg' : 'text-white/60'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrors({}) }}
            className={`flex-1 py-3 rounded-xl text-[15px] font-medium transition-all ${
              activeTab === 'register' ? 'bg-[#4CB0F1] text-black shadow-lg' : 'text-white/60'
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Error/Success */}
        {errors.general && (
          <div className={`mb-4 p-3 rounded-xl text-[13px] ${
            errors.general.includes('vérifié') || errors.general.includes('envoyé')
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {errors.general}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              value={loginData.identifier}
              onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
              placeholder="Email ou téléphone"
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              placeholder="Mot de passe"
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
            <div className="text-right">
              <Link href="/forgot-password" className="text-[14px] text-white/60 hover:text-white transition-colors">
                Mot de passe oublie ?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#4CB0F1] text-black rounded-2xl text-[16px] font-semibold shadow-lg shadow-[#4CB0F1]/20 disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                  placeholder="Prenom"
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                />
                {errors.firstName && <p className="mt-1 text-[12px] text-red-400">{errors.firstName}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                  placeholder="Nom"
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                />
                {errors.lastName && <p className="mt-1 text-[12px] text-red-400">{errors.lastName}</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, phone: e.target.value })
                    if (smsVerification.codeSent) {
                      setSmsVerification({ codeSent: false, codeVerified: false, sending: false, verifying: false, countdown: 0 })
                    }
                  }}
                  placeholder="Telephone"
                  disabled={smsVerification.codeVerified}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={smsVerification.sending || smsVerification.codeVerified || smsVerification.countdown > 0}
                className={`px-5 py-4 rounded-xl text-[14px] font-medium flex items-center gap-2 min-w-[90px] justify-center transition-all ${
                  smsVerification.codeVerified
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 border border-white/10 text-white disabled:opacity-50'
                }`}
              >
                {smsVerification.codeVerified ? <Check className="w-4 h-4" /> : null}
                {smsVerification.sending ? '...' :
                 smsVerification.codeVerified ? 'OK' :
                 smsVerification.countdown > 0 ? `${smsVerification.countdown}s` :
                 'Verifier'}
              </button>
            </div>

            {smsVerification.codeSent && !smsVerification.codeVerified && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={registerData.verificationCode}
                  onChange={(e) => setRegisterData({ ...registerData, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="Code a 6 chiffres"
                  maxLength={6}
                  className="flex-1 px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 text-center tracking-[0.3em] focus:outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={smsVerification.verifying || registerData.verificationCode.length !== 6}
                  className="px-6 py-4 bg-white text-black rounded-xl text-[14px] font-semibold disabled:opacity-50"
                >
                  {smsVerification.verifying ? '...' : 'Valider'}
                </button>
              </div>
            )}

            <div>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="Email"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              {errors.email && <p className="mt-1 text-[12px] text-red-400">{errors.email}</p>}
            </div>

            <div>
              <input
                type="text"
                value={registerData.dateOfBirth}
                onChange={(e) => setRegisterData({ ...registerData, dateOfBirth: formatDateOfBirth(e.target.value) })}
                placeholder="Date de naissance (JJ/MM/AAAA)"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              {errors.dateOfBirth && <p className="mt-1 text-[12px] text-red-400">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                placeholder="Mot de passe (min. 8 caracteres)"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              {errors.password && <p className="mt-1 text-[12px] text-red-400">{errors.password}</p>}
            </div>

            <div>
              <input
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                placeholder="Confirmer le mot de passe"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              {errors.confirmPassword && <p className="mt-1 text-[12px] text-red-400">{errors.confirmPassword}</p>}
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-[13px] text-white/50">
                En créant un compte, vos informations seront enregistrées pour faciliter vos prochaines réservations.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !smsVerification.codeVerified}
              className="w-full py-4 bg-[#4CB0F1] text-black rounded-2xl text-[16px] font-semibold shadow-lg shadow-[#4CB0F1]/20 disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {loading ? 'Creation...' : 'Creer mon compte'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
