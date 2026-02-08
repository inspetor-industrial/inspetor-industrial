import { useQuery } from '@tanstack/react-query'

export type DailyMaintenanceWithCompany = {
  id: string
  companyId: string
  equipmentId: string
  description: string
  operatorName: string
  createdAt: Date
  updatedAt: Date
  company: {
    name: string
  }
}

type DailyMaintenanceListResponse = {
  dailyMaintenances: DailyMaintenanceWithCompany[]
  totalPages: number
}

const DAILY_MAINTENANCE_QUERY_KEY = 'daily-maintenance'

async function fetchDailyMaintenanceList(
  equipmentId: string,
  search: string,
  page: number,
): Promise<DailyMaintenanceListResponse> {
  const params = new URLSearchParams()
  params.set('equipmentId', equipmentId)
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  const res = await fetch(`/api/daily-maintenance?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch daily maintenance')
  }
  const data = (await res.json()) as {
    dailyMaintenances: (Omit<
      DailyMaintenanceWithCompany,
      'createdAt' | 'updatedAt'
    > & {
      createdAt: string
      updatedAt: string
    })[]
    totalPages: number
  }
  return {
    dailyMaintenances: data.dailyMaintenances.map((d) => ({
      ...d,
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    })),
    totalPages: data.totalPages,
  }
}

export function useDailyMaintenanceQuery(
  equipmentId: string,
  search: string,
  page: number,
) {
  return useQuery({
    queryKey: [DAILY_MAINTENANCE_QUERY_KEY, equipmentId, search, page],
    queryFn: () => fetchDailyMaintenanceList(equipmentId, search, page),
    enabled: Boolean(equipmentId),
  })
}

export function getDailyMaintenanceQueryKey(): readonly [string] {
  return [DAILY_MAINTENANCE_QUERY_KEY]
}
