'use client'

import { createContextualCan } from '@casl/react'
import type { AppAbility } from '@inspetor/casl/ability'
import { createEmptyAbility, defineAbilityFor } from '@inspetor/casl/ability'
import { useSession } from '@inspetor/lib/auth/context'
import { createContext, type ReactNode, useContext, useMemo } from 'react'

const defaultAbility = createEmptyAbility()

export const AbilityContext = createContext<AppAbility>(defaultAbility)

export const Can = createContextualCan(AbilityContext.Consumer)

export function useAbility(): AppAbility {
  return useContext(AbilityContext) ?? defaultAbility
}

export function AbilityProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const user = session?.user
  const ability = useMemo(() => {
    if (!user) {
      return createEmptyAbility()
    }

    return defineAbilityFor(user)
  }, [user])

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}
