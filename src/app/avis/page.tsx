'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Quote, Send, LogIn, Eye, EyeOff } from 'lucide-react'

interface Review {
  id: string
  name: string
  rating: number
  comment: string | null
  adminReply: string | null
  adminReplyAt: string | null
  createdAt: string
}

interface Stats {
  totalReviews: number
  averageRating: number
  totalCustomers: number
}

export default function AvisPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>({ totalReviews: 0, averageRating: 0, totalCustomers: 0 })
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [customerName, setCustomerName] = useState('')

  // Login form state
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginData, setLoginData] = useState({ identifier: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Review form state
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    fetchReviews()
    checkAuth()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
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

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/customer/me')
      if (response.ok) {
        const data = await response.json()
        setIsLoggedIn(true)
        setCustomerName(data.customer.firstName)
      }
    } catch {
      setIsLoggedIn(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    if (!loginData.identifier.trim() || !loginData.password) {
      setLoginError('Email/téléphone et mot de passe requis')
      return
    }

    setLoginLoading(true)
    try {
      const response = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginData.identifier, password: loginData.password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      // Connexion réussie
      setIsLoggedIn(true)
      setCustomerName(data.customer.firstName)
      setShowLoginForm(false)
      setLoginData({ identifier: '', password: '' })
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Erreur de connexion')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (rating === 0) {
      setSubmitError('Veuillez sélectionner une note')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      // Add the new review to the list immediately
      if (data.review) {
        setReviews(prev => [data.review, ...prev])
        // Update stats
        setStats(prev => ({
          ...prev,
          totalReviews: prev.totalReviews + 1,
          averageRating: Math.round(((prev.averageRating * prev.totalReviews) + rating) / (prev.totalReviews + 1) * 10) / 10,
        }))
      }
      setSubmitSuccess(true)
      setRating(0)
      setComment('')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
    return `Il y a ${Math.floor(diffDays / 30)} mois`
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Avis clients</span>
        </div>
      </header>

      <div className="px-4 py-6 pb-safe max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Rating Summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-[24px] font-bold text-black">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-3 h-3 text-black"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] text-white/40 uppercase tracking-wide mb-1">Note moyenne</p>
                  <p className="text-[20px] font-bold text-white">
                    {stats.averageRating >= 4.5 ? 'Excellent' : stats.averageRating >= 4 ? 'Très bien' : stats.averageRating > 0 ? 'Bien' : 'Aucun avis'}
                  </p>
                  <p className="text-[14px] text-white/50 mt-1">
                    {stats.totalReviews} avis client{stats.totalReviews > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-[24px] font-bold text-white">
                  {stats.totalReviews > 0 ? '100%' : '-'}
                </p>
                <p className="text-[12px] text-white/50">Satisfaits</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-[24px] font-bold text-white">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
                </p>
                <p className="text-[12px] text-white/50">Note moyenne</p>
              </div>
            </div>

            {/* Leave a Review Section */}
            <div className="bg-[#4CB0F1]/10 border border-[#4CB0F1]/20 rounded-2xl p-5 mb-6">
              <h3 className="text-[16px] font-semibold text-white mb-4">Laisser un avis</h3>

              {!isLoggedIn ? (
                showLoginForm ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={loginData.identifier}
                        onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                        placeholder="Email ou téléphone"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[14px] text-white placeholder-white/30 focus:outline-none focus:border-[#4CB0F1]/50 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="Mot de passe"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[14px] text-white placeholder-white/30 focus:outline-none focus:border-[#4CB0F1]/50 transition-colors pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {loginError && (
                      <p className="text-[13px] text-red-400">{loginError}</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowLoginForm(false)}
                        className="flex-1 py-3 bg-white/10 rounded-xl text-[14px] font-medium text-white active:scale-[0.98] transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="flex-1 py-3 bg-[#4CB0F1] rounded-xl text-[14px] font-semibold text-black flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
                      >
                        {loginLoading ? 'Connexion...' : 'Se connecter'}
                      </button>
                    </div>

                    <p className="text-[12px] text-white/40 text-center">
                      Pas encore de compte ?{' '}
                      <Link href="/account" className="text-[#4CB0F1] underline">
                        Créer un compte
                      </Link>
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[14px] text-white/60 mb-4">
                      Connectez-vous pour partager votre expérience
                    </p>
                    <button
                      onClick={() => setShowLoginForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#4CB0F1] rounded-xl text-[14px] font-semibold text-black active:scale-[0.98] transition-all"
                    >
                      <LogIn className="w-4 h-4" />
                      Se connecter
                    </button>
                  </div>
                )
              ) : submitSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-green-400" fill="currentColor" />
                  </div>
                  <p className="text-[15px] text-white font-medium mb-2">Merci {customerName} !</p>
                  <p className="text-[13px] text-white/60">
                    Votre avis a été publié avec succès.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Star Rating */}
                  <div>
                    <p className="text-[13px] text-white/50 mb-2">Votre note</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform active:scale-90"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              star <= (hoverRating || rating)
                                ? 'text-yellow-400'
                                : 'text-white/20'
                            }`}
                            fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <p className="text-[13px] text-white/50 mb-2">Votre commentaire (optionnel)</p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Partagez votre expérience..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[14px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
                    />
                  </div>

                  {submitError && (
                    <p className="text-[13px] text-red-400">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="w-full py-3 bg-[#4CB0F1] rounded-xl text-[14px] font-semibold text-black flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
                  >
                    {submitting ? (
                      'Envoi...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer mon avis
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Reviews List */}
            {reviews.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-[15px] font-semibold text-white/60 px-1">Derniers avis</h2>

                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[15px] font-semibold text-white">{review.name}</p>
                        <p className="text-[12px] text-white/40">{formatDate(review.createdAt)}</p>
                      </div>
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

                    {review.comment && (
                      <div className="flex gap-3">
                        <Quote className="w-5 h-5 text-[#4CB0F1] flex-shrink-0 mt-0.5" />
                        <p className="text-[14px] text-white/70 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    )}

                    {/* Admin Reply */}
                    {review.adminReply && (
                      <div className="mt-4 bg-[#4CB0F1]/10 border border-[#4CB0F1]/20 rounded-xl p-4">
                        <p className="text-[12px] text-[#4CB0F1] font-medium mb-1">Réponse du salon</p>
                        <p className="text-[13px] text-white/80 leading-relaxed">{review.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {reviews.length === 0 && (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <Star className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-[15px] text-white/60">Aucun avis pour le moment</p>
                <p className="text-[13px] text-white/40 mt-1">Soyez le premier à partager votre expérience !</p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/#booking"
                className="block w-full py-4 bg-[#4CB0F1] rounded-2xl text-[15px] font-semibold text-black text-center shadow-lg shadow-[#4CB0F1]/20 active:scale-[0.98] transition-all"
              >
                Prendre rendez-vous
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
