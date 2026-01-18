import { auth } from '@inspetor/lib/auth/authjs'
import { getFullAuthenticatedUser } from '@inspetor/lib/auth/get-full-user'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import { redirect } from 'next/navigation'

import { BoilerList } from './boiler-list'
import { BoilerFilter } from './components/filter'

type BoilerPageProps = {
  searchParams: Promise<{
    search: string
    page: string
  }>
}

export default async function BoilerPage({ searchParams }: BoilerPageProps) {
  const { search, page } = await searchParams

  const session = await auth()
  const fullUser = await getFullAuthenticatedUser(session)
  if (!fullUser) {
    redirect('/auth/sign-in')
  }

  const pagination = calculatePagination(page)
  const boilerReports = await prisma.boilerReport.findMany({
    where: {
      companyId: fullUser.companyId ?? '',
      ...(search && {
        client: {
          companyName: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      }),
    },
    include: {
      client: true,
      engineer: true,
    },
    skip: pagination.skip,
    take: pagination.take,
    orderBy: {
      createdAt: 'desc',
    },
  })

  const totalBoilerReports = await prisma.boilerReport.count({
    where: {
      companyId: fullUser.companyId ?? '',
      ...(search && {
        client: {
          companyName: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      }),
    },
  })

  const totalPages = Math.ceil(totalBoilerReports / pagination.take)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Inspeções de Caldeiras</h1>

      <BoilerFilter />
      <BoilerList boilerReports={boilerReports} totalPages={totalPages} />
    </div>
  )
}
