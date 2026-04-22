import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Récupérer les disponibilités pour une période
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!staffId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'staffId, startDate et endDate requis' },
        { status: 400 }
      )
    }

    const availabilities = await prisma.staffAvailability.findMany({
      where: {
        staffId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    })

    return NextResponse.json(availabilities)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des disponibilités' },
      { status: 500 }
    )
  }
}

// POST - Créer ou mettre à jour les disponibilités pour un jour
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { staffId, date, timeSlots } = body

    if (!staffId || !date || !Array.isArray(timeSlots)) {
      return NextResponse.json(
        { error: 'staffId, date et timeSlots requis' },
        { status: 400 }
      )
    }

    // Valider que la date est valide
    const targetDate = new Date(date)
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: 'Format de date invalide' },
        { status: 400 }
      )
    }

    // Supprimer les anciennes disponibilités pour cette date
    await prisma.staffAvailability.deleteMany({
      where: {
        staffId,
        date: targetDate,
      },
    })

    // Créer les nouvelles disponibilités (matin + après-midi)
    const availabilities = await Promise.all(
      timeSlots.map((slot: { startTime: string; endTime: string }) =>
        prisma.staffAvailability.create({
          data: {
            staffId,
            date: targetDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBlocked: false,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      availabilities,
    })
  } catch (error) {
    console.error('Error creating availability:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création des disponibilités' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer toutes les disponibilités pour une date
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const date = searchParams.get('date')

    if (!staffId || !date) {
      return NextResponse.json(
        { error: 'staffId et date requis' },
        { status: 400 }
      )
    }

    const targetDate = new Date(date)
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: 'Format de date invalide' },
        { status: 400 }
      )
    }

    await prisma.staffAvailability.deleteMany({
      where: {
        staffId,
        date: targetDate,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Disponibilités supprimées',
    })
  } catch (error) {
    console.error('Error deleting availability:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des disponibilités' },
      { status: 500 }
    )
  }
}
