import { InvalidCredentialsError } from '@inspetor/errors/invalid-credentials-error'
import { auth } from '@inspetor/lib/auth/authjs'
import { prisma } from '@inspetor/lib/prisma'
import { createServerActionProcedure } from 'zsa'

export const authProcedure = createServerActionProcedure().handler(async () => {
  const session = await auth()

  if (!session || !session?.user?.email) {
    throw new InvalidCredentialsError()
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  })

  if (!user || !user?.companyId) {
    throw new InvalidCredentialsError()
  }

  if (user.status === 'INACTIVE') {
    throw new InvalidCredentialsError()
  }

  const organization = await prisma.company.findUnique({
    where: {
      id: user.companyId,
    },
  })

  if (!organization) {
    throw new InvalidCredentialsError()
  }

  return {
    user: {
      ...session.user,
      organization,
    },
  }
})
