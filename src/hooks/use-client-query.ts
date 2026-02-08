import { useQuery } from '@tanstack/react-query'

export type ClientListItem = {
  id: string
  companyName: string
  taxId: string
  taxRegistration: string | null
  state: string
  city: string
  address: string
  zipCode: string
  phone: string
  companyId: string | null
  createdAt: Date
  updatedAt: Date
  company: { name: string } | null
}

export type ClientOption = {
  id: string
  companyName: string
}

type ClientListResponse = {
  clients: ClientListItem[]
  totalPages: number
}

const CLIENT_QUERY_KEY = 'client'

const PER_PAGE_SELECT = 1000

async function fetchClientList(
  search: string,
  page: number,
  perPage = 10,
): Promise<ClientListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  params.set('perPage', String(perPage))
  const res = await fetch(`/api/clients?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch clients')
  }
  const data = (await res.json()) as {
    clients: (Omit<ClientListItem, 'createdAt' | 'updatedAt'> & {
      createdAt: string
      updatedAt: string
    })[]
    totalPages: number
  }
  return {
    clients: data.clients.map((c) => ({
      ...c,
      company: c.company ?? null,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    })),
    totalPages: data.totalPages,
  }
}

export function useClientQuery(search: string, page: number) {
  return useQuery({
    queryKey: [CLIENT_QUERY_KEY, search, page],
    queryFn: () => fetchClientList(search, page, 10),
  })
}

/** Fetches clients with a high limit for use in dropdowns/selects. */
export function useClientsForSelectQuery() {
  return useQuery({
    queryKey: [CLIENT_QUERY_KEY, 'select'],
    queryFn: () => fetchClientList('', 1, PER_PAGE_SELECT),
  })
}

export function getClientQueryKey(): readonly [string] {
  return [CLIENT_QUERY_KEY]
}
