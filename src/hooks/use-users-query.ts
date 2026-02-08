import type { UserRole, UserStatus } from '@inspetor/generated/prisma/client'
import { useQuery } from '@tanstack/react-query'

export type UserListItem = {
  id: string
  name: string | null
  email: string
  username: string | null
  companyId: string | null
  status: UserStatus
  role: UserRole
  createdAt: Date
  updatedAt: Date
  company: { name: string } | null
}

type UserListResponse = {
  users: UserListItem[]
  totalPages: number
}

const USERS_QUERY_KEY = 'users'

async function fetchUsersList(
  search: string,
  page: number,
  status: string,
): Promise<UserListResponse> {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('page', String(page))
  if (status === 'ACTIVE' || status === 'INACTIVE') {
    params.set('status', status)
  }
  const res = await fetch(`/api/users?${params.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch users')
  }
  const data = (await res.json()) as {
    users: (Omit<UserListItem, 'createdAt' | 'updatedAt'> & {
      createdAt: string
      updatedAt: string
    })[]
    totalPages: number
  }
  return {
    users: data.users.map((u) => ({
      ...u,
      company: u.company ?? null,
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
    })),
    totalPages: data.totalPages,
  }
}

export function useUsersQuery(search: string, page: number, status: string) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, search, page, status],
    queryFn: () => fetchUsersList(search, page, status),
  })
}

export function getUsersQueryKey(): readonly [string] {
  return [USERS_QUERY_KEY]
}
