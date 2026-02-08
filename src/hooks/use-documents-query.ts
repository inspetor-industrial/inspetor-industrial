import { useQuery } from '@tanstack/react-query'

export type DocumentListItem = {
  id: string
  companyId: string
  name: string
  type: string
  size: number
  cloudflareR2Key: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
  owner: {
    name: string
  }
}

type DocumentsListResponse = {
  documents: DocumentListItem[]
  totalPages: number
}

const DOCUMENTS_QUERY_KEY = 'documents'

async function fetchDocumentsList(
  search: string,
  page: number,
): Promise<DocumentsListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  const res = await fetch(`/api/documents?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch documents')
  }
  const data = (await res.json()) as {
    documents: (Omit<DocumentListItem, 'createdAt' | 'updatedAt'> & {
      createdAt: string
      updatedAt: string
    })[]
    totalPages: number
  }
  return {
    documents: data.documents.map((d) => ({
      ...d,
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    })),
    totalPages: data.totalPages,
  }
}

export function useDocumentsQuery(search: string, page: number) {
  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, search, page],
    queryFn: () => fetchDocumentsList(search, page),
  })
}

export function getDocumentsQueryKey(): readonly [string] {
  return [DOCUMENTS_QUERY_KEY]
}
