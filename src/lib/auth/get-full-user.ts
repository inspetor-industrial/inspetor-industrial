import type { User } from '@inspetor/generated/prisma/client'
import type { Session } from 'next-auth'

import { prisma } from '../prisma'

export async function getFullAuthenticatedUser(
  session: Session | null,
): Promise<User | null> {
  if (!session?.user?.username) {
    return null
  }

  return await prisma.user.findUnique({
    where: {
      username: session?.user?.username as string,
    },
    include: {
      company: true,
    },
  })
}
