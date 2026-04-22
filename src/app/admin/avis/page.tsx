'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Trash2, MessageSquare, Send, X, AlertTriangle, Flag } from 'lucide-react'

interface Review {
  id: string
  customerName: string
  customerPhone: string
  rating: number
  comment: string | null
  adminReply: string | null
  adminReplyAt: string | null
  isApproved: boolean
  createdAt: string
}

interface Stats {
  totalReviews: number
  averageRating: number
}

export default function AdminAvisPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>({ totalReviews: 0, averageRating: 0 })
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, adminReply: replyText }),
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...data.review } : r))
        setReplyingTo(null)
        setReplyText('')
      }
    } catch (error) {
      console.error('Error replying:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const handleRemoveReply = async (reviewId: string) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, adminReply: null }),
      })

      if (response.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, adminReply: null, adminReplyAt: null } : r))
      }
    } catch (error) {
      console.error('Error removing reply:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link
            href="/admin"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[17px] font-semibold text-white">Gestion des avis</span>
            <p className="text-[12px] text-white/50">
              {stats.totalReviews} avis • {stats.averageRating > 0 ? `${stats.averageRating}/5` : '-'}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 pb-safe max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl">
            <Star className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-[15px] text-white/60">Aucun avis pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[15px] font-semibold text-white">{review.customerName}</p>
                    <p className="text-[12px] text-white/40">{formatDate(review.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? 'text-yellow-400' : 'text-white/20'
                          }`}
                          fill={star <= review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-[14px] text-white/70 mb-4 leading-relaxed">
                    "{review.comment}"
                  </p>
                )}

                {/* Admin Reply */}
                {review.adminReply && (
                  <div className="bg-[#4CB0F1]/10 border border-[#4CB0F1]/20 rounded-xl p-3 mb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[12px] text-[#4CB0F1] font-medium mb-1">Votre réponse</p>
                        <p className="text-[13px] text-white/80">{review.adminReply}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveReply(review.id)}
                        className="text-white/40 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === review.id && (
                  <div className="mb-4">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Votre réponse..."
                      rows={2}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[14px] text-white placeholder-white/30 focus:outline-none focus:border-[#4CB0F1]/50 transition-colors resize-none mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText('')
                        }}
                        className="flex-1 py-2 bg-white/10 rounded-xl text-[13px] text-white"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleReply(review.id)}
                        disabled={submitting || !replyText.trim()}
                        className="flex-1 py-2 bg-[#4CB0F1] rounded-xl text-[13px] font-semibold text-black flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        {submitting ? 'Envoi...' : 'Répondre'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Moderation Panel */}
                {deleteConfirm === review.id && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-red-400 mb-2">
                          Modération de contenu
                        </p>
                        <p className="text-[13px] text-white/70 mb-3">
                          Supprimer cet avis car il contient des propos inappropriés (haineux, racistes, injurieux, etc.) ?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 py-2 bg-white/10 rounded-xl text-[13px] text-white"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="flex-1 py-2 bg-red-500 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {replyingTo !== review.id && deleteConfirm !== review.id && (
                  <div className="flex gap-2">
                    {!review.adminReply && (
                      <button
                        onClick={() => setReplyingTo(review.id)}
                        className="flex-1 py-2 bg-[#4CB0F1]/20 rounded-xl text-[13px] font-medium text-[#4CB0F1] flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Répondre
                      </button>
                    )}
                    {review.comment && (
                      <button
                        onClick={() => setDeleteConfirm(review.id)}
                        className="py-2 px-4 bg-white/5 border border-white/10 rounded-xl text-[13px] text-white/50 flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                        Signaler
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
