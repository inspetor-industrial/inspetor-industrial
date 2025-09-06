import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import { type Instruments } from '@prisma/client'

import { InstrumentFilter } from './components/filter'
import { InstrumentTable } from './components/table'

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
  let instruments: Instruments[] = []
  let totalInstruments = 0

  try {
    instruments = await prisma.instruments.findMany({
      where: {
        serialNumber: {
          contains: search,
          mode: 'insensitive',
        },
      },
      ...calculatePagination(page),
    })

    totalInstruments = await prisma.instruments.count({
      where: {
        serialNumber: {
          contains: search,
          mode: 'insensitive',
        },
      },
    })
  } catch {
    instruments = []
    totalInstruments = 0
  }

  const totalPages = Math.ceil(totalInstruments / 10)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Instrumentos</h1>

      <InstrumentFilter />
      <InstrumentTable instruments={instruments} totalPages={totalPages} />
    </div>
  )
}
