import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'aryanf192811@gmail.com'
  const passwordHash = await bcrypt.hash('123456', 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'FLEET_MANAGER',
      name: 'Aryan Admin'
    },
    create: {
      email,
      passwordHash,
      role: 'FLEET_MANAGER',
      name: 'Aryan Admin'
    }
  })

  console.log(`Successfully upserted user: ${user.email} as ${user.role}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
