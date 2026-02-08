import { useQuery } from '@tanstack/react-query'

export type BoilerReportListItem = {
  id: string
  type: string
  date: string | null
  nextInspectionDate: string | null
  createdAt: string
  companyId: string
  client: { companyName: string }
  engineer: { name: string | null; username: string | null }
}

type BoilerReportListResponse = {
  boilerReports: BoilerReportListItem[]
  totalPages: number
}

const BOILER_REPORTS_QUERY_KEY = 'boiler-reports'

async function fetchBoilerReportsList(
  search: string,
  page: number,
  companyId: string,
): Promise<BoilerReportListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  if (companyId) {
    params.set('companyId', companyId)
  }
  const res = await fetch(`/api/boiler-reports?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch boiler reports')
  }
  const data = (await res.json()) as {
    boilerReports: Array<{
      id: string
      type: string
      date: string | null
      nextInspectionDate: string | null
      createdAt: string
      companyId: string
      client: { companyName: string }
      engineer: { name: string | null; username: string | null }
    }>
    totalPages: number
  }
  return {
    boilerReports: data.boilerReports.map((r) => ({
      ...r,
      date: r.date ?? null,
      nextInspectionDate: r.nextInspectionDate ?? null,
    })),
    totalPages: data.totalPages,
  }
}

export function useBoilerReportsQuery(
  search: string,
  page: number,
  companyId: string,
) {
  return useQuery({
    queryKey: [BOILER_REPORTS_QUERY_KEY, search, page, companyId],
    queryFn: () => fetchBoilerReportsList(search, page, companyId),
  })
}

export function getBoilerReportsQueryKey(): readonly [string] {
  return [BOILER_REPORTS_QUERY_KEY]
}
