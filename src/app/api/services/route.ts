import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')

    if (!salonId) {
      return NextResponse.json({ error: 'salonId is required' }, { status: 400 })
    }

    const services = await prisma.service.findMany({
      where: {
        salonId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { salonId, name, description, durationMin, price } = body

    if (!salonId || !name || !durationMin) {
      return NextResponse.json(
        { error: 'salonId, name, and durationMin are required' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        salonId,
        name,
        description,
        durationMin: parseInt(durationMin),
        price: price ? parseFloat(price) : null,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
