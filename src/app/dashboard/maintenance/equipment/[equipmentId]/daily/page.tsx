import type { Equipment } from '@inspetor/generated/prisma/client'
import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { notFound } from 'next/navigation'

import { DailyMaintenanceFilter } from './components/filter'
import { DailyMaintenanceTable } from './components/table'

type DailyMaintenancePageProps = {
  params: Promise<{
    equipmentId: string
  }>
}

export default async function DailyMaintenancePage({
  params,
}: DailyMaintenancePageProps) {
  const { equipmentId } = await params

  const session = await getSession()
  const isAdmin = session?.user?.role?.toLowerCase() === 'admin'
  const userCompanyId = session?.user?.companyId ?? null

  if (!equipmentId) {
    notFound()
  }

  if (!isAdmin && userCompanyId === null) {
    notFound()
  }

  const where = isAdmin
    ? { id: equipmentId }
    : { id: equipmentId, companyId: userCompanyId as string }
  let equipment: Equipment | null = null
  try {
    equipment = await prisma.equipment.findFirst({
      where,
    })
  } catch {
    notFound()
  }

  if (!equipment) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Manutenções Diárias</h1>

      <DailyMaintenanceFilter equipment={equipment} />
      <DailyMaintenanceTable equipment={equipment} />
    </div>
  )
}
