'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Phone,
  MessageCircle,
  Check,
  Trash2,
  Users,
  UserCheck,
  UserPlus
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface WaitingEntry {
  id: string
  status: string
  notes: string | null
  createdAt: string
  customer: {
    id: string
    firstName: string
    lastName: string
    phone: string
    email: string | null
  }
}

interface WaitingListData {
  total: number
  waitingList: WaitingEntry[]
}

export default function WaitingListPage() {
  const [data, setData] = useState<WaitingListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'CONTACTED' | 'ALL'>('ACTIVE')

  useEffect(() => {
    fetchWaitingList()
  }, [statusFilter])

  async function fetchWaitingList() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/waiting-list?salonId=salon-demo&status=${statusFilter}`)
      if (!res.ok) throw new Error('Erreur lors du chargement')
      const result = await res.json()
      setData(result)
    } catch {
      setError('Impossible de charger la liste d\'attente')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/waiting-list/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Erreur lors de la mise a jour')
      fetchWaitingList()
    } catch {
      alert('Erreur lors de la mise a jour du statut')
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm('Supprimer cette entree ?')) return
    try {
      const res = await fetch(`/api/admin/waiting-list/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      fetchWaitingList()
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En attente' }
      case 'CONTACTED':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Contacte' }
      case 'CONVERTED':
        return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Converti' }
      default:
        return { bg: 'bg-white/10', text: 'text-white/60', label: status }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Liste d'attente</span>
        </div>
      </header>

      <div className="pb-24">
        {/* Title */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-[24px] font-semibold text-white mb-1">Liste d'attente</h1>
          <p className="text-[14px] text-white/60">Gérez les clients en attente de créneaux</p>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 bg-[#1c1c1e] rounded-xl p-1">
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-[#4CB0F1] text-black'
                  : 'text-white/60'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setStatusFilter('CONTACTED')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                statusFilter === 'CONTACTED'
                  ? 'bg-[#4CB0F1] text-black'
                  : 'text-white/60'
              }`}
            >
              Contactes
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-[#4CB0F1] text-black'
                  : 'text-white/60'
              }`}
            >
              Tous
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#4CB0F1] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4">
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-[14px] text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Data */}
        {data && !loading && !error && (
          <div className="px-4 space-y-4">
            {/* Stats Card */}
            <div className="bg-[#1c1c1e] rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#4CB0F1]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#4CB0F1]" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-white">{data.total}</p>
                <p className="text-[13px] text-white/50">personnes en attente</p>
              </div>
            </div>

            {/* Waiting List */}
            {data.waitingList.length === 0 ? (
              <div className="bg-[#1c1c1e] rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-[15px] font-medium text-white mb-1">Aucune personne en attente</p>
                <p className="text-[13px] text-white/50">Toutes les demandes ont ete traitees</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.waitingList.map((entry) => {
                  const statusBadge = getStatusBadge(entry.status)
                  return (
                    <div
                      key={entry.id}
                      className="bg-[#1c1c1e] rounded-xl overflow-hidden"
                    >
                      {/* Entry Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-[15px] font-semibold text-white">
                              {entry.customer.firstName} {entry.customer.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-white/40" />
                              <span className="text-[12px] text-white/40">
                                {format(new Date(entry.createdAt), 'dd MMM yyyy a HH:mm', { locale: fr })}
                              </span>
                            </div>
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg ${statusBadge.bg}`}>
                            <span className={`text-[11px] font-medium ${statusBadge.text}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {entry.notes && (
                          <div className="mb-3 p-3 bg-black/30 rounded-lg">
                            <p className="text-[13px] text-white/60 italic">{entry.notes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <a
                            href={`tel:${entry.customer.phone}`}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500/20 rounded-xl active:bg-green-500/30"
                          >
                            <Phone className="w-4 h-4 text-green-400" />
                            <span className="text-[13px] font-medium text-green-400">Appeler</span>
                          </a>
                          <a
                            href={`sms:${entry.customer.phone}`}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500/20 rounded-xl active:bg-blue-500/30"
                          >
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            <span className="text-[13px] font-medium text-blue-400">SMS</span>
                          </a>
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="px-4 pb-4 flex gap-2">
                        {entry.status === 'ACTIVE' && (
                          <button
                            onClick={() => updateStatus(entry.id, 'CONTACTED')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#4CB0F1]/20 rounded-xl active:bg-[#4CB0F1]/30"
                          >
                            <UserCheck className="w-4 h-4 text-[#4CB0F1]" />
                            <span className="text-[13px] font-medium text-[#4CB0F1]">Marquer contacte</span>
                          </button>
                        )}
                        {entry.status === 'CONTACTED' && (
                          <button
                            onClick={() => updateStatus(entry.id, 'CONVERTED')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500/20 rounded-xl active:bg-green-500/30"
                          >
                            <UserPlus className="w-4 h-4 text-green-400" />
                            <span className="text-[13px] font-medium text-green-400">Marquer converti</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="w-12 flex items-center justify-center py-3 bg-red-500/20 rounded-xl active:bg-red-500/30"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
