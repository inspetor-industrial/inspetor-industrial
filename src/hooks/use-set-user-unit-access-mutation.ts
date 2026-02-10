import { getCompanyUnitsQueryKey } from '@inspetor/hooks/use-company-units-query'
import { getUserUnitAccessQueryKey } from '@inspetor/hooks/use-user-unit-access-query'
import { getUsersQueryKey } from '@inspetor/hooks/use-users-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setUserUnitAccessAction } from '@inspetor/actions/users/set-user-unit-access'

type SetUserUnitAccessInput = {
  userId: string
  companyId: string
  scope: 'all' | 'restricted'
  allowedUnitIds: string[]
  defaultUnitId?: string | null
}

export function useSetUserUnitAccessMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SetUserUnitAccessInput) => setUserUnitAccessAction(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: getUserUnitAccessQueryKey(
          variables.userId,
          variables.companyId,
        ),
      })
      void queryClient.invalidateQueries({ queryKey: getUsersQueryKey() })
      void queryClient.invalidateQueries({
        queryKey: getCompanyUnitsQueryKey(variables.companyId),
      })
    },
  })
}
