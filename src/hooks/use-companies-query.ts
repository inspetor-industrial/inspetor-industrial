import { useQuery } from '@tanstack/react-query'

export type CompanyOption = {
  id: string
  name: string
}

export type CompaniesListResponse = {
  companies: CompanyOption[]
  total: number
}

const COMPANIES_QUERY_KEY = ['companies'] as const

async function fetchCompanies(): Promise<CompaniesListResponse> {
  const res = await fetch('/api/companies', { credentials: 'include' })
  if (!res.ok) {
    throw new Error('Failed to fetch companies')
  }
  return res.json() as Promise<CompaniesListResponse>
}

export function useCompaniesQuery() {
  return useQuery({
    queryKey: COMPANIES_QUERY_KEY,
    queryFn: fetchCompanies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
