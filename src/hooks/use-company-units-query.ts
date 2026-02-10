import { useQuery } from '@tanstack/react-query'

export type CompanyUnitListItem = {
  id: string
  name: string
  status: string
}

type CompanyUnitsResponse = {
  units: CompanyUnitListItem[]
  totalPages: number
}

const COMPANY_UNITS_QUERY_KEY = 'companyUnits'

async function fetchCompanyUnits(
  companyId: string,
  page: number,
): Promise<CompanyUnitsResponse> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  const res = await fetch(
    `/api/companies/${companyId}/units?${params.toString()}`,
    {
      credentials: 'include',
    },
  )
  if (!res.ok) {
    throw new Error('Failed to fetch company units')
  }
  return res.json() as Promise<CompanyUnitsResponse>
}

export function useCompanyUnitsQuery(
  companyId: string | null,
  page = 1,
) {
  return useQuery({
    queryKey: [COMPANY_UNITS_QUERY_KEY, companyId, page],
    queryFn: () => fetchCompanyUnits(companyId as string, page),
    enabled: Boolean(companyId),
  })
}

/** Fetches all units for a company (e.g. for UnitMultiSelect). No pagination. */
export function useCompanyUnitsForSelectQuery(companyId: string | null) {
  return useQuery({
    queryKey: [COMPANY_UNITS_QUERY_KEY, companyId, 'select'],
    queryFn: async (): Promise<CompanyUnitsResponse> => {
      if (!companyId) return { units: [], totalPages: 0 }
      const res = await fetch(
        `/api/companies/${companyId}/units?perPage=1000`,
        { credentials: 'include' },
      )
      if (!res.ok) throw new Error('Failed to fetch company units')
      return res.json() as Promise<CompanyUnitsResponse>
    },
    enabled: Boolean(companyId),
  })
}

export function getCompanyUnitsQueryKey(
  companyId: string | null,
): readonly [string, string | null] {
  return [COMPANY_UNITS_QUERY_KEY, companyId]
}
