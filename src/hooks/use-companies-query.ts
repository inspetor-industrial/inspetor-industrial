import type { CompanyStatus } from '@inspetor/generated/prisma/client'
import { useQuery } from '@tanstack/react-query'

export type CompanyListItem = {
  id: string
  name: string
  cnpj: string
  status: CompanyStatus
}

export type CompanyOption = CompanyListItem

type CompanyListResponse = {
  companies: CompanyListItem[]
  totalPages: number
}

const COMPANIES_QUERY_KEY = 'companies'

const PER_PAGE_SELECT = 1000

async function fetchCompaniesList(
  search: string,
  page: number,
  perPage = 10,
): Promise<CompanyListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  params.set('perPage', String(perPage))
  const res = await fetch(`/api/companies?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch companies')
  }
  return res.json() as Promise<CompanyListResponse>
}

export function useCompaniesQuery(search = '', page = 1) {
  return useQuery({
    queryKey: [COMPANIES_QUERY_KEY, search, page],
    queryFn: () => fetchCompaniesList(search, page, 10),
  })
}

/** Fetches companies with a high limit for use in dropdowns/selects (all companies in one request). */
export function useCompaniesForSelectQuery() {
  return useQuery({
    queryKey: [COMPANIES_QUERY_KEY, 'select'],
    queryFn: () => fetchCompaniesList('', 1, PER_PAGE_SELECT),
  })
}

export function getCompaniesQueryKey(): readonly [string] {
  return [COMPANIES_QUERY_KEY]
}
