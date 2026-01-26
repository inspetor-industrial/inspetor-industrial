import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import type { Clients } from '@inspetor/generated/prisma/client'

import { ClientFilter } from './components/filter'
import { ClientTable } from './components/table'

type ClientPageProps = {
  searchParams: Promise<{
    search: string
    page: string
  }>
}

export default async function ClientPage({ searchParams }: ClientPageProps) {
  const { search, page } = await searchParams
  let clients: Clients[] = []
  let totalClients = 0

  try {
    clients = await prisma.clients.findMany({
      where: {
        companyName: {
          contains: search,
          mode: 'insensitive',
        },
      },
      ...calculatePagination(page),
    })

    totalClients = await prisma.clients.count({
      where: {
        companyName: {
          contains: search,
          mode: 'insensitive',
        },
      },
    })
  } catch {
    clients = []
    totalClients = 0
  }

  const totalPages = Math.ceil(totalClients / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <ClientFilter />
      <ClientTable clients={clients} totalPages={totalPages} />
    </div>
  )
}
