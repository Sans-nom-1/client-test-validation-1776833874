import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

// Validation helpers
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const isValidPhone = (phone: string) => /^(\+33|0)[1-9]\d{8}$/.test(phone)
const isValidName = (name: string) => name.trim().length >= 2 && name.trim().length <= 50
const sanitize = (str: string) => str.trim().slice(0, 100)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = checkRateLimit(request)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt)
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, dateOfBirth, password, verificationCode } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !password || !verificationCode) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    // Sanitize inputs
    const cleanFirstName = sanitize(firstName)
    const cleanLastName = sanitize(lastName)
    const cleanEmail = email.trim().toLowerCase().slice(0, 255)
    const cleanPhone = phone.replace(/\s/g, '')

    // Validate formats
    if (!isValidName(cleanFirstName)) {
      return NextResponse.json({ error: 'Prénom invalide (2-50 caractères)' }, { status: 400 })
    }
    if (!isValidName(cleanLastName)) {
      return NextResponse.json({ error: 'Nom invalide (2-50 caractères)' }, { status: 400 })
    }
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }
    if (!isValidPhone(cleanPhone)) {
      return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 })
    }
    if (password.length < 8 || password.length > 100) {
      return NextResponse.json({ error: 'Mot de passe: 8-100 caractères' }, { status: 400 })
    }

    // Parse date
    let parsedDate: Date
    const isoMatch = dateOfBirth.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!isoMatch) {
      return NextResponse.json({ error: 'Format de date invalide' }, { status: 400 })
    }

    const [, year, month, day] = isoMatch.map(Number)
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > new Date().getFullYear()) {
      return NextResponse.json({ error: 'Date de naissance invalide' }, { status: 400 })
    }
    parsedDate = new Date(dateOfBirth)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Date de naissance invalide' }, { status: 400 })
    }

    // Verify phone code
    const verifiedCode = await prisma.verificationCode.findFirst({
      where: {
        phone: cleanPhone,
        code: verificationCode,
        type: 'PHONE_VERIFICATION',
        verified: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!verifiedCode) {
      return NextResponse.json({ error: 'Code de vérification invalide ou expiré' }, { status: 400 })
    }

    // Check for existing customer (phone or email)
    const existing = await prisma.customer.findFirst({
      where: {
        salonId: process.env.SALON_ID || 'salon-demo',
        OR: [{ phone: cleanPhone }, { email: cleanEmail }],
      },
      select: { phone: true, email: true },
    })

    if (existing) {
      if (existing.phone === cleanPhone) {
        return NextResponse.json({ error: 'Ce numéro de téléphone est déjà utilisé' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    // Create customer with hashed password
    const [customer] = await prisma.$transaction([
      prisma.customer.create({
        data: {
          salonId: process.env.SALON_ID || 'salon-demo',
          firstName: cleanFirstName,
          lastName: cleanLastName,
          email: cleanEmail,
          phone: cleanPhone,
          dateOfBirth: parsedDate,
          passwordHash: await bcrypt.hash(password, 10),
          marketingOptIn: false,
        },
        select: { id: true, firstName: true, lastName: true, phone: true, email: true },
      }),
      prisma.verificationCode.delete({ where: { id: verifiedCode.id } }),
    ])

    // Create session
    await createSession(customer.id, customer.phone, 'CUSTOMER')

    return NextResponse.json({ success: true, customer }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
  }
}
