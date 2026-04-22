'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Mail, Phone, Lock, User, Calendar, UserPlus, LogIn } from 'lucide-react'

interface AuthStepProps {
  onAuthenticated: () => void
  onBack: () => void
}

// Validation helpers
const validators = {
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: (v: string) => /^(\+33|0)[1-9]\d{8}$/.test(v.replace(/\s/g, '')),
  password: (v: string) => v.length >= 8,
  name: (v: string) => v.trim().length >= 2,
  date: (v: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(v),
}

const formatPhone = (v: string) => v.replace(/\s/g, '')
const formatDate = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 8)
  if (n.length <= 2) return n
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`
}

export default function AuthStep({ onAuthenticated, onBack }: AuthStepProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('register')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Register form
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    code: '',
  })

  // SMS verification state
  const [sms, setSms] = useState({
    sent: false,
    verified: false,
    sending: false,
    verifying: false,
    countdown: 0,
  })

  // Login form
  const [login, setLogin] = useState({ identifier: '', password: '' })

  // Check existing session
  useEffect(() => {
    fetch('/api/auth/customer/me')
      .then(r => r.ok && onAuthenticated())
      .catch(() => {})
      .finally(() => setCheckingAuth(false))
  }, [onAuthenticated])

  // Countdown timer
  useEffect(() => {
    if (sms.countdown <= 0) return
    const t = setTimeout(() => setSms(s => ({ ...s, countdown: s.countdown - 1 })), 1000)
    return () => clearTimeout(t)
  }, [sms.countdown])

  // Form update helper
  const updateForm = useCallback((field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
    if (field === 'phone' && sms.sent) {
      setSms({ sent: false, verified: false, sending: false, verifying: false, countdown: 0 })
    }
  }, [sms.sent])

  // Send verification code
  const sendCode = useCallback(async () => {
    const phone = formatPhone(form.phone)
    if (!validators.phone(phone)) {
      setError('Numéro de téléphone invalide')
      return
    }

    setSms(s => ({ ...s, sending: true }))
    setError('')

    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'PHONE_VERIFICATION' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSms(s => ({ ...s, sent: true, sending: false, countdown: 60 }))
      setSuccess('Code envoye par SMS')
    } catch (e) {
      setSms(s => ({ ...s, sending: false }))
      setError(e instanceof Error ? e.message : 'Erreur envoi SMS')
    }
  }, [form.phone])

  // Verify code
  const verifyCode = useCallback(async () => {
    if (form.code.length !== 6) {
      setError('Code a 6 chiffres requis')
      return
    }

    setSms(s => ({ ...s, verifying: true }))
    setError('')

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formatPhone(form.phone),
          code: form.code,
          type: 'PHONE_VERIFICATION',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSms(s => ({ ...s, verified: true, verifying: false }))
      setSuccess('Numéro vérifié !')
    } catch (e) {
      setSms(s => ({ ...s, verifying: false }))
      setError(e instanceof Error ? e.message : 'Code invalide')
    }
  }, [form.phone, form.code])

  // Register validation
  const registerValid = useMemo(() => {
    return validators.name(form.firstName) &&
           validators.name(form.lastName) &&
           validators.email(form.email) &&
           validators.phone(form.phone) &&
           validators.date(form.dateOfBirth) &&
           validators.password(form.password) &&
           sms.verified
  }, [form, sms.verified])

  // Handle register
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!registerValid) {
      if (!validators.name(form.firstName)) setError('Prenom requis (min. 2 caracteres)')
      else if (!validators.name(form.lastName)) setError('Nom requis (min. 2 caracteres)')
      else if (!validators.email(form.email)) setError('Email invalide')
      else if (!validators.phone(form.phone)) setError('Telephone invalide')
      else if (!validators.date(form.dateOfBirth)) setError('Date de naissance invalide')
      else if (!validators.password(form.password)) setError('Mot de passe min. 8 caracteres')
      else if (!sms.verified) setError('Vérifiez votre numéro de téléphone')
      return
    }

    setLoading(true)
    try {
      const [d, m, y] = form.dateOfBirth.split('/')
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: formatPhone(form.phone),
          dateOfBirth: `${y}-${m}-${d}`,
          password: form.password,
          verificationCode: form.code,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onAuthenticated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inscription')
    } finally {
      setLoading(false)
    }
  }, [form, sms.verified, registerValid, onAuthenticated])

  // Handle login
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!login.identifier.trim() || !login.password) {
      setError('Email/téléphone et mot de passe requis')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: login.identifier.trim(),
          password: login.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.redirectTo) {
        router.push(data.redirectTo)
        return
      }

      onAuthenticated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }, [login, onAuthenticated, router])

  // Loading state
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in w-full max-w-lg mx-auto">
      {/* Header avec icone */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-[22px] font-semibold text-white">Identification</h2>
          <p className="text-[14px] text-white/50">Connectez-vous ou creez un compte</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1.5 bg-white/5 rounded-2xl">
        <button
          onClick={() => { setTab('register'); setError(''); setSuccess('') }}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[16px] font-medium transition-all ${
            tab === 'register' ? 'bg-[#4CB0F1] text-black shadow-lg' : 'text-white/60'
          }`}
        >
          <UserPlus className="w-5 h-5" />
          Inscription
        </button>
        <button
          onClick={() => { setTab('login'); setError(''); setSuccess('') }}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[16px] font-medium transition-all ${
            tab === 'login' ? 'bg-[#4CB0F1] text-black shadow-lg' : 'text-white/60'
          }`}
        >
          <LogIn className="w-5 h-5" />
          Connexion
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[14px]">
          {error}
        </div>
      )}
      {success && !error && (
        <div className="mb-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-[14px] flex items-center gap-2">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Register Form */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={form.firstName}
                onChange={e => updateForm('firstName', e.target.value)}
                placeholder="Prenom"
                className="w-full px-4 py-5 pl-12 bg-white/5 border border-white/10 rounded-2xl text-[16px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                autoComplete="given-name"
              />
            </div>
            <input
              type="text"
              value={form.lastName}
              onChange={e => updateForm('lastName', e.target.value)}
              placeholder="Nom"
              className="w-full px-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-[16px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="family-name"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="email"
              value={form.email}
              onChange={e => updateForm('email', e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-5 pl-12 bg-white/5 border border-white/10 rounded-2xl text-[16px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="email"
            />
          </div>

          {/* Date of birth */}
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={form.dateOfBirth}
              onChange={e => updateForm('dateOfBirth', formatDate(e.target.value))}
              placeholder="Date de naissance (JJ/MM/AAAA)"
              className="w-full px-4 py-5 pl-12 bg-white/5 border border-white/10 rounded-2xl text-[16px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="bday"
            />
          </div>

          {/* Phone + Verification */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => updateForm('phone', e.target.value)}
                  placeholder="Telephone"
                  disabled={sms.verified}
                  className="w-full px-4 py-5 pl-12 bg-white/5 border border-white/10 rounded-2xl text-[16px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                  autoComplete="tel"
                />
              </div>
              <button
                type="button"
                onClick={sendCode}
                disabled={sms.sending || sms.verified || sms.countdown > 0}
                className={`px-6 py-5 rounded-2xl text-[15px] font-semibold flex items-center gap-2 min-w-[100px] justify-center transition-all ${
                  sms.verified
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-[#4CB0F1] text-black disabled:bg-white/10 disabled:text-white/40'
                }`}
              >
                {sms.verified && <Check className="w-5 h-5" />}
                {sms.sending ? '...' :
                 sms.verified ? 'OK' :
                 sms.countdown > 0 ? `${sms.countdown}s` : 'Verifier'}
              </button>
            </div>
            <p className="text-[13px] text-white/40 px-1">Pour recevoir vos rappels SMS</p>
          </div>

          {/* Verification code input */}
          {sms.sent && !sms.verified && (
            <div className="flex gap-3 animate-fade-in">
              <input
                type="text"
                inputMode="numeric"
                value={form.code}
                onChange={e => updateForm('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Code a 6 chiffres"
                maxLength={6}
                className="flex-1 px-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-[18px] text-white placeholder-white/30 text-center tracking-[0.4em] focus:outline-none focus:border-white/30"
              />
              <button
                type="button"
                onClick={verifyCode}
                disabled={sms.verifying || form.code.length !== 6}
                className="px-8 py-5 bg-[#4CB0F1] text-black rounded-2xl text-[15px] font-semibold disabled:opacity-50 disabled:bg-white/10 disabled:text-white/40"
              >
                {sms.verifying ? '...' : 'Valider'}
              </button>
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="password"
              value={form.password}
              onChange={e => updateForm('password', e.target.value)}
              placeholder="Mot de passe (min. 8 caracteres)"
              className="w-full px-4 py-5 pl-12 bg-white/5 border border-white/10 rounded-2xl text-[16px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="new-password"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={loading || !registerValid}
              className={`w-full py-5 rounded-2xl text-[17px] font-semibold transition-all active:scale-[0.98] ${
                registerValid
                  ? 'bg-[#4CB0F1] text-black shadow-lg shadow-[#4CB0F1]/20'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {loading ? 'Inscription...' : "S'inscrire et continuer"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-4 text-[16px] text-white/50 text-center hover:text-white/70 transition-colors"
            >
              Retour
            </button>
          </div>
        </form>
      )}

      {/* Login Form */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={login.identifier}
              onChange={e => { setLogin(l => ({ ...l, identifier: e.target.value })); setError('') }}
              placeholder="Email ou téléphone"
              className="w-full px-4 py-5 pl-12 bg-white/5 border border-white/10 rounded-2xl text-[16px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="password"
              value={login.password}
              onChange={e => { setLogin(l => ({ ...l, password: e.target.value })); setError('') }}
              placeholder="Mot de passe"
              className="w-full px-4 py-5 pl-12 bg-white/5 border border-white/10 rounded-2xl text-[16px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="current-password"
            />
          </div>

          <div className="text-right">
            <a href="/forgot-password" className="text-[15px] text-[#4CB0F1] hover:text-[#6BC1F5] transition-colors">
              Mot de passe oublie ?
            </a>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl text-[17px] font-semibold bg-[#4CB0F1] text-black shadow-lg shadow-[#4CB0F1]/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-4 text-[16px] text-white/50 text-center hover:text-white/70 transition-colors"
            >
              Retour
            </button>
          </div>
        </form>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
