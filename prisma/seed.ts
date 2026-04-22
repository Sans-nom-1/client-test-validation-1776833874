// ═══════════════════════════════════════════════════════════════════════════
// SEED - Genere par SaaS Factory
// Cree le salon, le staff admin, et les services
// ═══════════════════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SALON_ID = "cmo9l0ijd00000mpca7ol829y"

const services = [
  {
    "id": "cmo9l0ims00030mpcy4diw73t",
    "name": "Coupe Test",
    "description": "Test e2e",
    "durationMin": 30,
    "price": 25,
    "category": "test",
    "isActive": true,
    "sortOrder": 0
  }
]

async function main() {
  console.log('Seeding database...')

  // 1. Creer le salon (idempotent)
  await prisma.salon.upsert({
    where: { id: SALON_ID },
    update: {
      name: "Test Health Check",
      address: "1 rue du Test, 75001 Paris",
      phone: "0100000000",
      timezone: "Europe/Paris",
      settings: JSON.stringify({
        openingHours: {
  "sunday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "monday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "tuesday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "wednesday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "thursday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "friday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "saturday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  }
},
        smsEnabled: false,
      }),
    },
    create: {
      id: SALON_ID,
      name: "Test Health Check",
      address: "1 rue du Test, 75001 Paris",
      phone: "0100000000",
      timezone: "Europe/Paris",
      settings: JSON.stringify({
        openingHours: {
  "sunday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "monday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "tuesday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "wednesday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "thursday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "friday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  },
  "saturday": {
    "start": "09:00",
    "end": "19:00",
    "closed": true
  }
},
        smsEnabled: false,
      }),
    },
  })
  console.log('Salon cree:', "Test Health Check")

  // 2. Creer le staff admin si inexistant
  const existingAdmin = await prisma.staff.findFirst({
    where: { salonId: SALON_ID, role: 'ADMIN' },
  })
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10)
    await prisma.staff.create({
      data: {
        salonId: SALON_ID,
        name: 'Admin',
        email: "test-healthcheck@example.com",
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      },
    })
    console.log('Staff admin cree (mot de passe: admin123 - a changer!)')
  }

  // 3. Seeder les services
  let created = 0
  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        name: service.name,
        description: service.description,
        durationMin: service.durationMin,
        price: service.price,
        category: service.category,
        isActive: service.isActive,
      },
      create: {
        id: service.id,
        salonId: SALON_ID,
        name: service.name,
        description: service.description,
        durationMin: service.durationMin,
        price: service.price,
        category: service.category,
        isActive: service.isActive,
      },
    })
    created++
  }
  console.log(`${created} services seedes!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
