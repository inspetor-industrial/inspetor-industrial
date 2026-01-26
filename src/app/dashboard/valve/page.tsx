import { auth } from '@inspetor/lib/auth/authjs'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import type { Valve } from '@inspetor/generated/prisma/client'

import { ValveFilter } from './components/filter'
import { ValveTable } from './components/table'

type ValvePageProps = {
  searchParams: Promise<{
    search: string
    page: string
  }>
}

export default async function ValvePage({ searchParams }: ValvePageProps) {
  const { search, page } = await searchParams
  const session = await auth()

  let valves: Valve[] = []
  let totalValves = 0

  try {
    valves = await prisma.valve.findMany({
      where: {
        serialNumber: {
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
      ...calculatePagination(page),
    })

    totalValves = await prisma.valve.count({
      where: {
        serialNumber: {
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
    valves = []
    totalValves = 0
  }

  const totalPages = Math.ceil(totalValves / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Válvulas</h1>

      <ValveFilter />
      <ValveTable valves={valves} totalPages={totalPages} />
    </div>
  )
}
