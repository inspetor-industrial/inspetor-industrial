import { useQuery } from '@tanstack/react-query'

export type EquipmentWithCompany = {
  id: string
  companyId: string
  name: string
  model: string
  createdAt: Date
  updatedAt: Date
  category: string
  identificationNumber: string
  manufactorYear: string
  mark: string
  pmta: string
  type: string
  company: {
    name: string
  }
  units: { id: string; name: string }[]
}

type EquipmentListResponse = {
  equipments: EquipmentWithCompany[]
  totalPages: number
}

const EQUIPMENT_QUERY_KEY = 'equipment'

async function fetchEquipmentList(
  search: string,
  page: number,
): Promise<EquipmentListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  const res = await fetch(`/api/equipment?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch equipment')
  }
  const data = (await res.json()) as {
    equipments: (Omit<
      EquipmentWithCompany,
      'createdAt' | 'updatedAt'
    > & {
      createdAt: string
      updatedAt: string
    })[]
    totalPages: number
  }
  return {
    equipments: data.equipments.map((e) => ({
      ...e,
      units: e.units ?? [],
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
    })),
    totalPages: data.totalPages,
  }
}

export function useEquipmentQuery(search: string, page: number) {
  return useQuery({
    queryKey: [EQUIPMENT_QUERY_KEY, search, page],
    queryFn: () => fetchEquipmentList(search, page),
  })
}

export function getEquipmentQueryKey(): readonly [string] {
  return [EQUIPMENT_QUERY_KEY]
}
