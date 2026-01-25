import { auth } from '@inspetor/lib/auth/authjs'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import { type Bomb, type Documents } from '@prisma/client'

import { BombFilter } from './components/filter'
import { BombTable } from './components/table'

type BombPageProps = {
  searchParams: Promise<{
    search: string
    page: string
  }>
}

type BombWithPhoto = Bomb & {
  photo: Documents
}

export default async function BombPage({ searchParams }: BombPageProps) {
  const { search, page } = await searchParams
  const session = await auth()

  let bombs: BombWithPhoto[] = []
  let totalBombs = 0

  try {
    bombs = await prisma.bomb.findMany({
      where: {
        mark: {
          contains: search,
          mode: 'insensitive',
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
      include: {
        photo: true,
      },
      ...calculatePagination(page),
    })

    totalBombs = await prisma.bomb.count({
      where: {
        mark: {
          contains: search,
          mode: 'insensitive',
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
    bombs = []
    totalBombs = 0
  }

  const totalPages = Math.ceil(totalBombs / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Bombas</h1>

      <BombFilter />
      <BombTable bombs={bombs} totalPages={totalPages} />
    </div>
  )
}
