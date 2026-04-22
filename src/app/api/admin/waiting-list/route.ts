import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')
    const status = searchParams.get('status') || 'ACTIVE' // ACTIVE, CONTACTED, CONVERTED, ALL

    if (!salonId) {
      return NextResponse.json(
        { error: 'salonId est requis' },
        { status: 400 }
      )
    }

    // Build where clause
    const whereClause: any = {
      salonId,
    }

    if (status !== 'ALL') {
      whereClause.status = status
    }

    // Fetch waiting list
    const waitingList = await prisma.waitingList.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // FIFO - First In First Out
      },
    })

    return NextResponse.json({
      waitingList,
      total: waitingList.length,
    })
  } catch (error) {
    console.error('Error fetching waiting list:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la liste d\'attente' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      )
    }

    const { salonId, customerId, notes } = await request.json()

    if (!salonId || !customerId) {
      return NextResponse.json(
        { error: 'salonId et customerId sont requis' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Check if customer is already in waiting list
    const existingEntry = await prisma.waitingList.findFirst({
      where: {
        salonId,
        customerId,
        status: 'ACTIVE',
      },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Ce client est déjà dans la liste d\'attente' },
        { status: 409 }
      )
    }

    // Create waiting list entry
    const waitingListEntry = await prisma.waitingList.create({
      data: {
        salonId,
        customerId,
        notes,
        status: 'ACTIVE',
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(waitingListEntry, { status: 201 })
  } catch (error) {
    console.error('Error creating waiting list entry:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout à la liste d\'attente' },
      { status: 500 }
    )
  }
}
