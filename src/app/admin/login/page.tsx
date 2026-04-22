'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion')
        setLoading(false)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Erreur de connexion au serveur')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/" className="w-10 h-10 flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Connexion Admin</span>
        </div>
      </header>

      <div className="px-4 py-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-semibold text-white mb-2">Espace Admin</h1>
          <p className="text-[14px] text-white/60">Connectez-vous pour gérer votre salon</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-[14px] text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] text-white/50 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lvlup.fr"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-[#1c1c1e] rounded-xl text-[15px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#4CB0F1] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[13px] text-white/50 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-[#1c1c1e] rounded-xl text-[15px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#4CB0F1] disabled:opacity-50"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#4CB0F1] rounded-xl text-[15px] font-semibold text-black disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>

{/* Credentials supprimés pour sécurité */}
      </div>
    </div>
  )
}
