import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import type { UserStatus } from '@inspetor/generated/prisma/client'

import { UserFilter } from './components/filter'
import { UserTable } from './components/table'

type UsersPageProps = {
  searchParams: Promise<{
    search: string
    page: string
    status: string
  }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { search, page, status } = await searchParams
  let users: any[] = []
  let totalUsers = 0

  const session = await getSession()

  try {
    users = await prisma.user.findMany({
      where: {
        name: {
          contains: search,
        },
        status: status as UserStatus | undefined,
        company:
          session?.user.role.toLowerCase() !== 'admin'
            ? {
                users: {
                  some: {
                    username: session?.user.username ?? 'unknown',
                  },
                },
              }
            : undefined,
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
      ...calculatePagination(page),
    })

    totalUsers = await prisma.user.count({
      where: {
        name: {
          contains: search,
        },
        company:
          session?.user.role.toLowerCase() !== 'admin'
            ? {
                users: {
                  some: {
                    username: session?.user.username ?? 'unknown',
                  },
                },
              }
            : undefined,
      },
    })
  } catch {
    users = []
    totalUsers = 0
  }

  const totalPages = Math.ceil(totalUsers / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Usuários</h1>

      <UserFilter />
      <UserTable users={users} totalPages={totalPages} />
    </div>
  )
}
