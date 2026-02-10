import { useQuery } from '@tanstack/react-query'

export type UserUnitAccessData = {
  scope: 'all' | 'restricted'
  allowedUnitIds: string[]
  defaultUnitId: string | null
}

const USER_UNIT_ACCESS_QUERY_KEY = 'userUnitAccess'

async function fetchUserUnitAccess(
  userId: string,
  companyId: string,
): Promise<UserUnitAccessData | null> {
  const res = await fetch(
    `/api/users/${userId}/unit-access?companyId=${encodeURIComponent(companyId)}`,
    { credentials: 'include' },
  )
  if (!res.ok) return null
  return res.json() as Promise<UserUnitAccessData | null>
}

export function useUserUnitAccessQuery(
  userId: string | null,
  companyId: string | null,
) {
  return useQuery({
    queryKey: [USER_UNIT_ACCESS_QUERY_KEY, userId, companyId],
    queryFn: () =>
      fetchUserUnitAccess(userId as string, companyId as string),
    enabled: Boolean(userId && companyId),
  })
}

export function getUserUnitAccessQueryKey(
  userId: string | null,
  companyId: string | null,
): readonly [string, string | null, string | null] {
  return [USER_UNIT_ACCESS_QUERY_KEY, userId, companyId]
}
