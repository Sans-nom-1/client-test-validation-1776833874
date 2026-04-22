import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Exporter toutes les données du client (Droit à la portabilité - RGPD Art. 20)
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer toutes les données du client
    const customer = await prisma.customer.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        marketingOptIn: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    // Récupérer les rendez-vous
    const appointments = await prisma.appointment.findMany({
      where: { customerId: session.userId },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        notes: true,
        createdAt: true,
        service: {
          select: {
            name: true,
            durationMin: true,
            price: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { startAt: 'desc' },
    })

    // Récupérer les visites
    const visits = await prisma.visit.findMany({
      where: { customerId: session.userId },
      select: {
        id: true,
        occurredAt: true,
        amount: true,
        serviceSnapshot: true,
        createdAt: true,
      },
      orderBy: { occurredAt: 'desc' },
    })

    // Récupérer l'historique des consentements
    const consentLogs = await prisma.consentLog.findMany({
      where: { customerId: session.userId },
      select: {
        type: true,
        value: true,
        source: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Récupérer les logs SMS (sans contenu sensible)
    const smsLogs = await prisma.smsLog.findMany({
      where: { customerId: session.userId },
      select: {
        type: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Récupérer les annulations
    const cancellations = await prisma.cancellationLog.findMany({
      where: { customerId: session.userId },
      select: {
        cancelledAt: true,
        cancelledBy: true,
        reason: true,
        originalStartAt: true,
      },
      orderBy: { cancelledAt: 'desc' },
    })

    // Construire l'objet d'export
    const exportData = {
      exportDate: new Date().toISOString(),
      exportType: 'RGPD_PORTABILITY',
      customer: {
        ...customer,
        dateOfBirth: customer.dateOfBirth?.toISOString().split('T')[0] || null,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
      },
      appointments: appointments.map((apt) => ({
        ...apt,
        startAt: apt.startAt.toISOString(),
        endAt: apt.endAt.toISOString(),
        createdAt: apt.createdAt.toISOString(),
      })),
      visits: visits.map((v) => ({
        ...v,
        occurredAt: v.occurredAt.toISOString(),
        createdAt: v.createdAt.toISOString(),
      })),
      consentHistory: consentLogs.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
      communications: smsLogs.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
      cancellations: cancellations.map((c) => ({
        ...c,
        cancelledAt: c.cancelledAt.toISOString(),
        originalStartAt: c.originalStartAt.toISOString(),
      })),
    }

    // Retourner en JSON avec headers appropriés pour le téléchargement
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mes-donnees-levelup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Error exporting customer data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    )
  }
}
