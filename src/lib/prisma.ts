import { env } from '@inspetor/env'
import { PrismaClient } from '@inspetor/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
})

export const prisma = new PrismaClient({ adapter })
