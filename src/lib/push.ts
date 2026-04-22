// Web Push notification helper
// Requires env vars: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

import webpush from 'web-push'

let initialized = false

function init() {
  if (initialized) return
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return
  webpush.setVapidDetails(
    `mailto:${process.env.SALON_EMAIL || 'contact@salon.fr'}`,
    publicKey,
    privateKey
  )
  initialized = true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

export interface PushSubscriptionData {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return { success: false, error: 'VAPID keys not configured' }
  }
  try {
    init()
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: subscription.keys },
      JSON.stringify(payload)
    )
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Push failed'
    console.error('[Push] Erreur envoi:', msg)
    return { success: false, error: msg }
  }
}

// Envoyer à tous les abonnés d'un salon
export async function sendPushToSalon(
  salonId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const { prisma } = await import('./prisma')
  const subscriptions = await prisma.pushSubscription.findMany({ where: { salonId } })

  let sent = 0, failed = 0
  for (const sub of subscriptions) {
    const result = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    )
    if (result.success) sent++
    else {
      failed++
      // Supprimer les subscriptions expirées/invalides
      if (result.error?.includes('410') || result.error?.includes('404')) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
      }
    }
  }
  return { sent, failed }
}

// Envoyer à un client spécifique
export async function sendPushToCustomer(
  customerId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const { prisma } = await import('./prisma')
  const subscriptions = await prisma.pushSubscription.findMany({ where: { customerId } })

  let sent = 0, failed = 0
  for (const sub of subscriptions) {
    const result = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    )
    if (result.success) sent++
    else {
      failed++
      if (result.error?.includes('410') || result.error?.includes('404')) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
      }
    }
  }
  return { sent, failed }
}
