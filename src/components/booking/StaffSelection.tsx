'use client'

import { useEffect, useState } from 'react'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Staff {
  id: string
  name: string
  role: string
}

interface StaffSelectionProps {
  salonId: string
  onSelect: (staffId: string | null) => void
  onBack: () => void
}

export default function StaffSelection({ salonId, onSelect, onBack }: StaffSelectionProps) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaff()
  }, [salonId])

  const fetchStaff = async () => {
    try {
      // Pour le MVP, on peut hardcoder ou créer une route API
      // Ici je simule avec les données qu'on connaît
      setStaff([
        { id: 'staff-jean', name: 'Jean Coiffeur', role: 'Coiffeur' },
        { id: 'staff-marie', name: 'Marie Styliste', role: 'Styliste' },
      ])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-black uppercase text-white">Choisissez votre barbier</h2>

      {/* Option "Peu importe" */}
      <Card
        hover
        onClick={() => onSelect(null)}
        className="mb-4 cursor-pointer border-2 border-dashed border-primary bg-primary/50 active:scale-95 hover:border-primary-light"
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="mb-1">Peu importe</CardTitle>
            <CardDescription>Le premier barbier disponible</CardDescription>
          </div>
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>

      {/* Liste des barbiers */}
      <div className="grid gap-4 md:grid-cols-2">
        {staff.map((member) => (
          <Card
            key={member.id}
            hover
            onClick={() => onSelect(member.id)}
            className="active:scale-95"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="mb-1">{member.name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
              </div>
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto min-h-[48px]">
          ← Retour
        </Button>
      </div>
    </div>
  )
}
