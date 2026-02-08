import { useQuery } from '@tanstack/react-query'

export type InstrumentListItem = {
  id: string
  serialNumber: string
  certificateNumber: string
  manufacturer: string
  type: string
  validationDate: Date
  companyId: string
  company: { name: string } | null
}

type InstrumentListResponse = {
  instruments: InstrumentListItem[]
  totalPages: number
}

const INSTRUMENTS_QUERY_KEY = 'instruments'

async function fetchInstrumentsList(
  search: string,
  page: number,
  companyId: string,
): Promise<InstrumentListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  if (companyId) {
    params.set('companyId', companyId)
  }
  const res = await fetch(`/api/instruments?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch instruments')
  }
  const data = (await res.json()) as {
    instruments: Array<{
      id: string
      serialNumber: string
      certificateNumber: string
      manufacturer: string
      type: string
      validationDate: string
      companyId: string
      company: { name: string } | null
    }>
    totalPages: number
  }
  return {
    instruments: data.instruments.map((i) => {
      const raw = i.validationDate
      const parsed =
        typeof raw === 'string'
          ? new Date(raw)
          : (raw as unknown) instanceof Date
            ? (raw as Date)
            : new Date(String(raw))
      const validationDate =
        parsed instanceof Date && !Number.isNaN(parsed.getTime())
          ? parsed
          : new Date(0)
      return {
        ...i,
        validationDate,
        company: i.company ?? null,
      }
    }),
    totalPages: data.totalPages,
  }
}

export function useInstrumentsQuery(
  search: string,
  page: number,
  companyId: string,
) {
  return useQuery({
    queryKey: [INSTRUMENTS_QUERY_KEY, search, page, companyId],
    queryFn: () => fetchInstrumentsList(search, page, companyId),
  })
}

export function getInstrumentsQueryKey(): readonly [string] {
  return [INSTRUMENTS_QUERY_KEY]
}
