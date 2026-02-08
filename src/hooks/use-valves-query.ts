import { useQuery } from '@tanstack/react-query'

export type ValveListItem = {
  id: string
  serialNumber: string
  model: string
  diameter: number
  flow: number
  openingPressure: number
  closingPressure: number
  companyId: string
  company: { name: string } | null
}

type ValveListResponse = {
  valves: ValveListItem[]
  totalPages: number
}

const VALVES_QUERY_KEY = 'valves'

async function fetchValvesList(
  search: string,
  page: number,
  companyId: string,
): Promise<ValveListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  if (companyId) {
    params.set('companyId', companyId)
  }
  const res = await fetch(`/api/valves?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch valves')
  }
  const data = (await res.json()) as {
    valves: Array<{
      id: string
      serialNumber: string
      model: string
      diameter: number | string
      flow: number | string
      openingPressure: number | string
      closingPressure: number | string
      companyId: string
      company: { name: string } | null
    }>
    totalPages: number
  }
  return {
    valves: data.valves.map((v) => ({
      ...v,
      diameter: Number(v.diameter),
      flow: Number(v.flow),
      openingPressure: Number(v.openingPressure),
      closingPressure: Number(v.closingPressure),
      company: v.company ?? null,
    })),
    totalPages: data.totalPages,
  }
}

export function useValvesQuery(
  search: string,
  page: number,
  companyId: string,
) {
  return useQuery({
    queryKey: [VALVES_QUERY_KEY, search, page, companyId],
    queryFn: () => fetchValvesList(search, page, companyId),
  })
}

export function getValvesQueryKey(): readonly [string] {
  return [VALVES_QUERY_KEY]
}
