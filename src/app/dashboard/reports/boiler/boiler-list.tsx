'use client'

import type { BoilerReport } from '@inspetor/generated/prisma/browser'

import { BoilerTable } from './components/boiler-table'

type BoilerListProps = {
  boilerReports: (BoilerReport & {
    client: { companyName: string }
    engineer: { name: string | null; username: string | null }
  })[]
  totalPages: number
}

export function BoilerList({ boilerReports, totalPages }: BoilerListProps) {
  return <BoilerTable boilerReports={boilerReports} totalPages={totalPages} />
}
