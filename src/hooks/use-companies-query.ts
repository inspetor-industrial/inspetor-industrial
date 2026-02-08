import type { CompanyStatus } from '@inspetor/generated/prisma/client'
import { useQuery } from '@tanstack/react-query'

export type CompanyListItem = {
  id: string
  name: string
  cnpj: string
  status: CompanyStatus
}

type CompanyListResponse = {
  companies: CompanyListItem[]
  totalPages: number
}

const COMPANIES_QUERY_KEY = 'companies'

async function fetchCompaniesList(
  search: string,
  page: number,
): Promise<CompanyListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  const res = await fetch(`/api/companies?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch companies')
  }
  return res.json() as Promise<CompanyListResponse>
}

export function useCompaniesQuery(search: string, page: number) {
  return useQuery({
    queryKey: [COMPANIES_QUERY_KEY, search, page],
    queryFn: () => fetchCompaniesList(search, page),
  })
}

export function getCompaniesQueryKey(): readonly [string] {
  return [COMPANIES_QUERY_KEY]
}
