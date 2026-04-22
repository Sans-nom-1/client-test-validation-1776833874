import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(request: Request) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, dateOfBirth } = body

    // Validation
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.replace(/\s/g, '')

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Check if email or phone is already taken by another customer
    const existing = await prisma.customer.findFirst({
      where: {
        id: { not: session.userId },
        OR: [{ phone: cleanPhone }, { email: cleanEmail }],
      },
      select: { phone: true, email: true },
    })

    if (existing) {
      if (existing.phone === cleanPhone) {
        return NextResponse.json({ error: 'Ce numéro de téléphone est déjà utilisé' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Parse and validate date of birth
    let parsedDate = null
    if (dateOfBirth) {
      // Support both French format (DD/MM/YYYY) and ISO format (YYYY-MM-DD)
      const frenchDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
      const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/

      const frenchMatch = dateOfBirth.match(frenchDateRegex)
      const isoMatch = dateOfBirth.match(isoDateRegex)

      if (frenchMatch) {
        const [, day, month, year] = frenchMatch
        parsedDate = new Date(`${year}-${month}-${day}`)
      } else if (isoMatch) {
        parsedDate = new Date(dateOfBirth)
      } else {
        return NextResponse.json(
          { error: 'Format de date invalide' },
          { status: 400 }
        )
      }

      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Date de naissance invalide' },
          { status: 400 }
        )
      }
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: session.userId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        ...(parsedDate && { dateOfBirth: parsedDate }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
      },
    })

    return NextResponse.json({
      customer: updatedCustomer,
      message: 'Informations mises à jour avec succès',
    })
  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
