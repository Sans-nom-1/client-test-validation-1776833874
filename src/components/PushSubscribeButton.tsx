'use client'

import { useState, useEffect } from 'react'

interface Props {
  className?: string
  label?: string
  labelActive?: string
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)))
}

export function PushSubscribeButton({
  className = '',
  label = 'Activer les notifications',
  labelActive = 'Notifications activées',
}: Props) {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !vapidKey) return
    setSupported(true)

    // Vérifier si déjà abonné
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setSubscribed(!!sub)
      })
    })
  }, [vapidKey])

  if (!supported) return null

  const handleToggle = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready

      if (subscribed) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          })
        }
        setSubscribed(false)
      } else {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey!),
        })

        const json = sub.toJSON()
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
          }),
        })
        setSubscribed(true)
      }
    } catch (err) {
      console.error('[Push] Erreur toggle:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={className || `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
        subscribed
          ? 'bg-green-600/20 border border-green-600/40 text-green-400 hover:bg-red-600/20 hover:border-red-600/40 hover:text-red-400'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      } disabled:opacity-50`}
    >
      <span>{subscribed ? '🔔' : '🔕'}</span>
      {loading ? '...' : subscribed ? labelActive : label}
    </button>
  )
}
