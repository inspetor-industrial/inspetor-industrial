import { auth } from '@inspetor/lib/auth/authjs'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'

import { DailyMaintenanceFilter } from './components/filter'
import { DailyMaintenanceTable } from './components/table'

type DailyMaintenancePageProps = {
  searchParams: Promise<{
    search: string
    page: string
  }>
}

export default async function DailyMaintenancePage({
  searchParams,
}: DailyMaintenancePageProps) {
  const { search, page } = await searchParams
  let dailyMaintenances: any[] = []
  let totalDailyMaintenances = 0

  const session = await auth()

  try {
    dailyMaintenances = await prisma.dailyMaintenance.findMany({
      where: {
        equipment: {
          contains: search,
        },
        company:
          session?.user.role.toLowerCase() !== 'admin'
            ? {
                users: {
                  some: {
                    email: session?.user.email ?? 'unknown',
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

    totalDailyMaintenances = await prisma.dailyMaintenance.count({
      where: {
        equipment: {
          contains: search,
        },
      },
    })
  } catch {
    dailyMaintenances = []
    totalDailyMaintenances = 0
  }

  const totalPages = Math.ceil(totalDailyMaintenances / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Manutenções Diárias</h1>

      <DailyMaintenanceFilter />
      <DailyMaintenanceTable
        dailyMaintenances={dailyMaintenances}
        totalPages={totalPages}
      />
    </div>
  )
}
