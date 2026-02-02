import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import type { Equipment } from '@inspetor/generated/prisma/client'
import { notFound } from 'next/navigation'

import { DailyMaintenanceFilter } from './components/filter'
import { DailyMaintenanceTable } from './components/table'

type DailyMaintenancePageProps = {
  params: Promise<{
    equipmentId: string
  }>
  searchParams: Promise<{
    search: string
    page: string
  }>
}

export default async function DailyMaintenancePage({
  params,
  searchParams,
}: DailyMaintenancePageProps) {
  const { equipmentId } = await params
  const { search, page } = await searchParams
  let dailyMaintenances: any[] = []
  let totalDailyMaintenances = 0

  const session = await getSession()

  if (!equipmentId) {
    notFound()
  }

  let equipment: Equipment | null = null
  try {
    equipment = await prisma.equipment.findUnique({
      where: {
        id: equipmentId,
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

    if (!equipment) {
      notFound()
    }
  } catch {
    notFound()
  }

  if (!equipment) {
    notFound()
  }

  try {
    dailyMaintenances = await prisma.dailyMaintenance.findMany({
      where: {
        equipmentId: equipment.id,
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

    totalDailyMaintenances = await prisma.dailyMaintenance.count({
      where: {
        equipment: {
          name: {
            contains: search,
          },
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
    dailyMaintenances = []
    totalDailyMaintenances = 0
  }

  const totalPages = Math.ceil(totalDailyMaintenances / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Manutenções Diárias</h1>

      <DailyMaintenanceFilter equipment={equipment} />
      <DailyMaintenanceTable
        dailyMaintenances={dailyMaintenances}
        totalPages={totalPages}
        equipment={equipment}
      />
    </div>
  )
}
