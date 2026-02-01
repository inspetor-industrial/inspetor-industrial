import { InvalidCredentialsError } from '@inspetor/errors/invalid-credentials-error'
import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { createServerActionProcedure } from 'zsa'

import { getUserByUsernameOrEmail } from '../utils/get-user-by-username-or-email'

export const authProcedure = createServerActionProcedure().handler(async () => {
  const session = await getSession()

  if (!session || (!session?.user?.email && !session?.user?.username)) {
    throw new InvalidCredentialsError()
  }

  const user = await getUserByUsernameOrEmail({
    email: session?.user?.email as string,
    username: session?.user?.username as string,
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
      ...user,
      organization,
    },
  }
})
