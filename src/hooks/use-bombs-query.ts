import { useQuery } from '@tanstack/react-query'

export type BombListItem = {
  id: string
  companyId: string
  mark: string
  model: string
  stages: string
  potency: number
  photoId: string
  company: { name: string } | null
  photo: { id: string; name: string } | null
}

type BombListResponse = {
  bombs: BombListItem[]
  totalPages: number
}

const BOMBS_QUERY_KEY = 'bombs'

async function fetchBombsList(
  search: string,
  page: number,
  companyId: string,
): Promise<BombListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  if (companyId) {
    params.set('companyId', companyId)
  }
  const res = await fetch(`/api/bombs?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch bombs')
  }
  const data = (await res.json()) as {
    bombs: Array<{
      id: string
      companyId: string
      mark: string
      model: string
      stages: string
      potency: number | string
      photoId: string
      company: { name: string } | null
      photo: { id: string; name: string } | null
    }>
    totalPages: number
  }
  return {
    bombs: data.bombs.map((b) => ({
      ...b,
      potency: Number(b.potency),
      company: b.company ?? null,
      photo: b.photo ?? null,
    })),
    totalPages: data.totalPages,
  }
}

export function useBombsQuery(
  search: string,
  page: number,
  companyId: string,
) {
  return useQuery({
    queryKey: [BOMBS_QUERY_KEY, search, page, companyId],
    queryFn: () => fetchBombsList(search, page, companyId),
  })
}

export function getBombsQueryKey(): readonly [string] {
  return [BOMBS_QUERY_KEY]
}
