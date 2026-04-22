import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les disponibilités d'un staff pour une période
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const staffId = searchParams.get('staffId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!staffId) {
      return NextResponse.json({ error: 'staffId requis' }, { status: 400 })
    }

    const where: any = { staffId }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const availability = await prisma.staffAvailability.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}

// POST - Créer ou mettre à jour des disponibilités
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { staffId, date, startTime, endTime, isBlocked, reason } = body

    if (!staffId || !date) {
      return NextResponse.json(
        { error: 'staffId et date requis' },
        { status: 400 }
      )
    }

    // Vérifier si une disponibilité existe déjà pour ce jour
    const existing = await prisma.staffAvailability.findFirst({
      where: {
        staffId,
        date: new Date(date),
      },
    })

    let availability

    if (existing) {
      // Mettre à jour
      availability = await prisma.staffAvailability.update({
        where: { id: existing.id },
        data: {
          startTime: startTime || existing.startTime,
          endTime: endTime || existing.endTime,
          isBlocked: isBlocked !== undefined ? isBlocked : existing.isBlocked,
          reason: reason !== undefined ? reason : existing.reason,
        },
      })
    } else {
      // Créer
      availability = await prisma.staffAvailability.create({
        data: {
          staffId,
          date: new Date(date),
          startTime: startTime || '09:00',
          endTime: endTime || '19:00',
          isBlocked: isBlocked || false,
          reason,
        },
      })
    }

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error creating availability:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une disponibilité
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    await prisma.staffAvailability.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting availability:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
