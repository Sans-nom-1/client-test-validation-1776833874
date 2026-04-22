'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string | null
}

export default function EditProfilePage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/customer/me')

      if (!response.ok) {
        router.push('/account')
        return
      }

      const data = await response.json()
      setCustomer(data.customer)

      let dobFormatted = ''
      if (data.customer.dateOfBirth) {
        const date = new Date(data.customer.dateOfBirth)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        dobFormatted = `${day}/${month}/${year}`
      }

      setFormData({
        firstName: data.customer.firstName || '',
        lastName: data.customer.lastName || '',
        email: data.customer.email || '',
        phone: data.customer.phone || '',
        dateOfBirth: dobFormatted,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      router.push('/account')
    } finally {
      setLoading(false)
    }
  }

  const formatDateOfBirth = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 8)
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Le prénom et le nom sont requis')
      return
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email invalide')
      return
    }

    if (!formData.phone.trim()) {
      setError('Le téléphone est requis')
      return
    }

    let isoDate = null
    if (formData.dateOfBirth) {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
      const match = formData.dateOfBirth.match(dateRegex)
      if (!match) {
        setError('Format de date invalide (JJ/MM/AAAA)')
        return
      }

      const [, day, month, year] = match
      const dayNum = parseInt(day, 10)
      const monthNum = parseInt(month, 10)
      const yearNum = parseInt(year, 10)

      if (monthNum < 1 || monthNum > 12) {
        setError('Mois invalide')
        return
      } else if (dayNum < 1 || dayNum > 31) {
        setError('Jour invalide')
        return
      } else if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
        setError('Année invalide')
        return
      }

      isoDate = `${year}-${month}-${day}`
    }

    setSaving(true)
    try {
      const response = await fetch('/api/auth/customer/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone,
          dateOfBirth: isoDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/account/profile')
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/account/profile" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Modifier mes infos</span>
        </div>
      </header>

      <div className="px-4 py-6">
        <h1 className="text-[24px] font-semibold text-white mb-1">Mes informations</h1>
        <p className="text-[14px] text-white/60 mb-6">Mettez à jour vos informations personnelles</p>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-[14px] text-red-400">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <p className="text-[14px] text-green-400">Informations mises à jour !</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] text-white/50 mb-2">Prénom</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Jean"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] text-white/50 mb-2">Nom</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Dupont"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] text-white/50 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jean@email.com"
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] text-white/50 mb-2">Date de naissance</label>
            <input
              type="text"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: formatDateOfBirth(e.target.value) })}
              placeholder="JJ/MM/AAAA"
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] text-white/50 mb-2">Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
            <p className="text-[11px] text-white/30 mt-1">La modification du téléphone nécessite une nouvelle vérification</p>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-[#4CB0F1] text-black rounded-2xl text-[15px] font-semibold shadow-lg shadow-[#4CB0F1]/20 disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>

            <Link href="/account/profile">
              <button
                type="button"
                className="w-full py-3 text-[15px] text-white/50 text-center hover:text-white/70 transition-colors"
              >
                Annuler
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
