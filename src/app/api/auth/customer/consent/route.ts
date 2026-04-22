import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Récupérer les consentements actuels du client
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.userId },
      select: {
        marketingOptIn: true,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    // Récupérer l'historique des consentements
    const consentHistory = await prisma.consentLog.findMany({
      where: { customerId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      consents: {
        marketing: customer.marketingOptIn,
        smsReminders: true, // Toujours true car c'est un intérêt légitime pour les RDV
      },
      history: consentHistory.map((log) => ({
        type: log.type,
        value: log.value,
        source: log.source,
        createdAt: log.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching consents:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des consentements' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les consentements
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { marketing } = body

    if (typeof marketing !== 'boolean') {
      return NextResponse.json(
        { error: 'Le champ marketing doit être un booléen' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.userId },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    // Mettre à jour le consentement marketing
    await prisma.customer.update({
      where: { id: session.userId },
      data: { marketingOptIn: marketing },
    })

    // Logger le changement de consentement
    await prisma.consentLog.create({
      data: {
        salonId: customer.salonId,
        customerId: session.userId,
        type: 'MARKETING',
        value: marketing,
        source: 'account_settings',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Consentements mis à jour',
      consents: {
        marketing,
        smsReminders: true,
      },
    })
  } catch (error) {
    console.error('Error updating consents:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des consentements' },
      { status: 500 }
    )
  }
}
