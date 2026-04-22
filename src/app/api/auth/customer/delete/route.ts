import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, deleteSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// DELETE - Supprimer le compte et toutes les données (Droit à l'effacement - RGPD Art. 17)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { password, confirmation } = body

    // Vérifier la confirmation
    if (confirmation !== 'SUPPRIMER MON COMPTE') {
      return NextResponse.json(
        { error: 'Veuillez confirmer la suppression en écrivant "SUPPRIMER MON COMPTE"' },
        { status: 400 }
      )
    }

    // Récupérer le client
    const customer = await prisma.customer.findUnique({
      where: { id: session.userId },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    // Vérifier le mot de passe
    if (!customer.passwordHash) {
      return NextResponse.json(
        { error: 'Compte sans mot de passe, contactez le support' },
        { status: 400 }
      )
    }

    const passwordValid = await bcrypt.compare(password, customer.passwordHash)
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier s'il y a des rendez-vous futurs
    const futureAppointments = await prisma.appointment.findMany({
      where: {
        customerId: session.userId,
        status: 'BOOKED',
        startAt: { gte: new Date() },
      },
    })

    if (futureAppointments.length > 0) {
      return NextResponse.json(
        {
          error: `Vous avez ${futureAppointments.length} rendez-vous à venir. Veuillez les annuler avant de supprimer votre compte.`,
        },
        { status: 400 }
      )
    }

    // Procéder à la suppression
    // Note: Les relations sont configurées avec onDelete: Cascade dans Prisma
    // donc les données liées seront supprimées automatiquement

    // 1. Logger le consentement à la suppression (pour preuve légale)
    await prisma.consentLog.create({
      data: {
        salonId: customer.salonId,
        customerId: customer.id,
        type: 'ACCOUNT_DELETION',
        value: true,
        source: 'account_settings_self_service',
      },
    })

    // 2. Anonymiser les données des rendez-vous passés plutôt que les supprimer
    // (pour garder les stats du salon)
    await prisma.appointment.updateMany({
      where: { customerId: session.userId },
      data: { notes: null },
    })

    // 3. Supprimer les logs SMS
    await prisma.smsLog.deleteMany({
      where: { customerId: session.userId },
    })

    // 4. Supprimer les entrées de liste d'attente
    await prisma.waitingList.deleteMany({
      where: { customerId: session.userId },
    })

    // 5. Supprimer le client (cascade: visits, appointments, consentLogs, cancellationLogs)
    await prisma.customer.delete({
      where: { id: session.userId },
    })

    // 6. Supprimer la session
    await deleteSession()

    return NextResponse.json({
      success: true,
      message: 'Votre compte et toutes vos données personnelles ont été supprimés.',
    })
  } catch (error) {
    console.error('Error deleting customer account:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte' },
      { status: 500 }
    )
  }
}
