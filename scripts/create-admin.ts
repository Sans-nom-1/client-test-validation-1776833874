import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating admin account...')

  // Create admin password
  const adminPassword = await bcrypt.hash('admin123', 10)

  // Upsert admin
  const admin = await prisma.staff.upsert({
    where: { email: 'admin@lvlup.fr' },
    update: { passwordHash: adminPassword },
    create: {
      salonId: 'salon-demo',
      name: 'Admin LVL UP',
      email: 'admin@lvlup.fr',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Admin created:', admin.email)

  // Check existing staff
  const allStaff = await prisma.staff.findMany({ select: { id: true, email: true, role: true, passwordHash: true } })
  console.log('All staff:', allStaff.map(s => ({ email: s.email, role: s.role, hasPassword: !!s.passwordHash })))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
