import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'

import { EquipmentFilter } from './components/filter'
import { EquipmentTable } from './components/table'

type EquipmentPageProps = {
  searchParams: Promise<{
    search: string
    page: number
  }>
}

export default async function EquipmentPage({
  searchParams,
}: EquipmentPageProps) {
  const { search, page } = await searchParams
  let equipments: any[] = []
  let totalEquipments = 0

  const session = await getSession()

  try {
    equipments = await prisma.equipment.findMany({
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
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
      ...calculatePagination(page),
    })

    totalEquipments = await prisma.equipment.count({
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
    equipments = []
    totalEquipments = 0
  }

  const totalPages = Math.ceil(totalEquipments / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Equipamentos</h1>

      <EquipmentFilter />
      <EquipmentTable equipments={equipments} totalPages={totalPages} />
    </div>
  )
}
