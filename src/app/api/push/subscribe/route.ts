import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const getSalonId = () => process.env.SALON_ID || 'salon-demo'

// POST /api/push/subscribe — enregistrer une subscription
export async function POST(req: NextRequest) {
  try {
    const { endpoint, keys, customerId: bodyCustomerId } = await req.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Subscription invalide' }, { status: 400 })
    }

    const salonId = getSalonId()

    // Récupérer le customerId depuis la session si dispo
    let customerId: string | null = bodyCustomerId || null
    try {
      const session = await getSession()
      if (session?.userId) customerId = session.userId
    } catch { /* session optionnelle */ }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { salonId, endpoint, p256dh: keys.p256dh, auth: keys.auth, customerId },
      update: { p256dh: keys.p256dh, auth: keys.auth, customerId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Push] Erreur subscribe:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/push/subscribe — se désabonner
export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'endpoint requis' }, { status: 400 })
    await prisma.pushSubscription.deleteMany({ where: { endpoint } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
