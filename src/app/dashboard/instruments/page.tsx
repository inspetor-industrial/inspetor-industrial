import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import { Company } from '@prisma/client'

import { CompanyFilter } from './components/filter'
import { CompanyTable } from './components/table'

type InstrumentsPageProps = {
  searchParams: Promise<{
    search: string
    page: string
  }>
}

export default async function InstrumentsPage({
  searchParams,
}: InstrumentsPageProps) {
  const { search, page } = await searchParams
  let companies: Company[] = []
  let totalCompanies = 0

  try {
    companies = await prisma.company.findMany({
      where: {
        name: {
          contains: search,
        },
      },
      ...calculatePagination(page),
    })

    totalCompanies = await prisma.company.count({
      where: {
        name: {
          contains: search,
        },
      },
    })
  } catch {
    companies = []
    totalCompanies = 0
  }

  const totalPages = Math.ceil(totalCompanies / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Instrumentos</h1>

      <CompanyFilter />
      <CompanyTable companies={companies} totalPages={totalPages} />
    </div>
  )
}
