import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { status, notes } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: 'status est requis' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['ACTIVE', 'CONTACTED', 'CONVERTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status invalide. Valeurs acceptées: ACTIVE, CONTACTED, CONVERTED' },
        { status: 400 }
      )
    }

    // Check if entry exists
    const existingEntry = await prisma.waitingList.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entrée non trouvée' },
        { status: 404 }
      )
    }

    // Update entry
    const updateData: any = {
      status,
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    // If marking as contacted, update contactedAt and contactedBy
    if (status === 'CONTACTED' && existingEntry.status !== 'CONTACTED') {
      updateData.contactedAt = new Date()
      updateData.contactedBy = session.userId
    }

    const updatedEntry = await prisma.waitingList.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Error updating waiting list entry:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la liste d\'attente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if entry exists
    const existingEntry = await prisma.waitingList.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entrée non trouvée' },
        { status: 404 }
      )
    }

    // Delete entry
    await prisma.waitingList.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting waiting list entry:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'entrée' },
      { status: 500 }
    )
  }
}
