import { useQuery } from '@tanstack/react-query'

export type StorageListItem = {
  id: string
  companyId: string
  relativeLink: string
  status: string
  createdAt: Date
  updatedAt: Date
  company: {
    name: string
    id: string
  }
  units: { id: string; name: string }[]
}

type StoragesListResponse = {
  storages: StorageListItem[]
  totalPages: number
}

const STORAGES_QUERY_KEY = 'storages'

async function fetchStoragesList(
  search: string,
  page: number,
): Promise<StoragesListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  const res = await fetch(`/api/storages?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch storages')
  }
  const data = (await res.json()) as {
    storages: (Omit<StorageListItem, 'createdAt' | 'updatedAt'> & {
      createdAt: string
      updatedAt: string
    })[]
    totalPages: number
  }
  return {
    storages: data.storages.map((s) => ({
      ...s,
      units: s.units ?? [],
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    })),
    totalPages: data.totalPages,
  }
}

export function useStoragesQuery(search: string, page: number) {
  return useQuery({
    queryKey: [STORAGES_QUERY_KEY, search, page],
    queryFn: () => fetchStoragesList(search, page),
  })
}

export function getStoragesQueryKey(): readonly [string] {
  return [STORAGES_QUERY_KEY]
}
