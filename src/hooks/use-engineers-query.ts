import { useQuery } from '@tanstack/react-query'

export type EngineerOption = {
  id: string
  name: string | null
  username: string | null
}

type EngineerListResponse = {
  engineers: EngineerOption[]
  totalPages: number
}

const ENGINEERS_QUERY_KEY = 'engineers'

const PER_PAGE_SELECT = 1000

async function fetchEngineersList(
  page: number,
  perPage: number,
  companyId?: string,
): Promise<EngineerListResponse> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('perPage', String(perPage))
  if (companyId) {
    params.set('companyId', companyId)
  }
  const res = await fetch(`/api/engineers?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch engineers')
  }
  return res.json() as Promise<EngineerListResponse>
}

/** Fetches engineers with a high limit for use in dropdowns/selects. */
export function useEngineersForSelectQuery(companyId?: string) {
  return useQuery({
    queryKey: [ENGINEERS_QUERY_KEY, 'select', companyId],
    queryFn: () => fetchEngineersList(1, PER_PAGE_SELECT, companyId),
  })
}

export function getEngineersQueryKey(): readonly [string] {
  return [ENGINEERS_QUERY_KEY]
}
