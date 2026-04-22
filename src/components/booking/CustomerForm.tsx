'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface CustomerFormProps {
  onSubmit: (data: { firstName: string; lastName: string; phone: string }) => void
  onBack: () => void
}

export default function CustomerForm({ onSubmit, onBack }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if customer is logged in and pre-fill form
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/customer/me')

        if (response.ok) {
          const data = await response.json()
          setFormData({
            firstName: data.customer.firstName,
            lastName: data.customer.lastName,
            phone: data.customer.phone,
          })
          setIsLoggedIn(true)
        }
      } catch (error) {
        console.log('Not logged in')
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis'
    } else if (!/^(\+33|0)[1-9](\d{8})$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro de téléphone invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      await onSubmit({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone.replace(/\s/g, ''),
      })
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-black uppercase text-white">Vos coordonnées</h2>

      {/* Login status */}
      {isLoggedIn ? (
        <div className="mb-4 rounded-lg border-2 border-green-500 bg-green-500/20 p-4">
          <p className="text-sm font-medium text-green-500">
            ✓ Connecté - Vos informations ont été pré-remplies
          </p>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border-2 border-primary bg-primary/20 p-4">
          <p className="text-sm font-medium text-white">
            Vous avez déjà un compte ?{' '}
            <Link href="/account" className="font-bold underline hover:text-primary-light">
              Connectez-vous
            </Link>{' '}
            pour pré-remplir vos informations
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Prénom *"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            error={errors.firstName}
            placeholder="Jean"
          />

          <Input
            label="Nom *"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            error={errors.lastName}
            placeholder="Dupont"
          />
        </div>

        <Input
          label="Téléphone *"
          type="tel"
          value={formData.phone}
          onChange={handleChange('phone')}
          error={errors.phone}
          placeholder="+33 6 12 34 56 78"
        />

        <div className="rounded-lg border-2 border-primary bg-primary p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-white">
            En confirmant ce rendez-vous, vous recevrez un SMS de confirmation ainsi qu'un rappel
            24h avant votre rendez-vous.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto min-h-[48px]">
            ← Retour
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto min-h-[48px]">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span className="font-bold">Confirmation...</span>
              </span>
            ) : (
              'Confirmer le rendez-vous'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
