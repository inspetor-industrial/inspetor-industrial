import { prisma } from '@inspetor/lib/prisma'

type GetUserByUsernameOrEmailParams = {
  username?: string | null
  email?: string | null
}

export async function getUserByUsernameOrEmail({
  username,
  email,
}: GetUserByUsernameOrEmailParams) {
  let user = await prisma.user.findUnique({
    where: {
      email: email ?? undefined,
    },
  })

  if (!user) {
    user = await prisma.user.findUnique({
      where: {
        username: username ?? undefined,
      },
    })
  }

  return user
}
