import { auth } from '@inspetor/lib/auth/authjs'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'

import { StorageFilter } from './components/filter'
import { StorageTable } from './components/table'

type CompanyPageProps = {
  searchParams: Promise<{
    search: string
    page: string
  }>
}

export default async function StoragePage({ searchParams }: CompanyPageProps) {
  const { search, page } = await searchParams
  let storages: any[] = []
  let totalStorages = 0

  const session = await auth()

  try {
    storages = await prisma.storage.findMany({
      where: {
        company: {
          name: {
            contains: search,
          },
          users:
            session?.user.role.toLowerCase() !== 'admin'
              ? {
                  some: {
                    username: session?.user.username ?? 'unknown',
                  },
                }
              : undefined,
        },
      },
      include: {
        company: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      ...calculatePagination(page),
    })

    totalStorages = await prisma.storage.count({
      where: {
        company: {
          name: {
            contains: search,
          },
          users:
            session?.user.role.toLowerCase() !== 'admin'
              ? {
                  some: {
                    username: session?.user.username ?? 'unknown',
                  },
                }
              : undefined,
        },
      },
    })
  } catch {
    storages = []
    totalStorages = 0
  }

  const totalPages = Math.ceil(totalStorages / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Pastas do Google Drive</h1>

      <StorageFilter />
      <StorageTable storages={storages} totalPages={totalPages} />
    </div>
  )
}
