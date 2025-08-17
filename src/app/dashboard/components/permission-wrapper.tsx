'use client'

import { useRouter } from '@bprogress/next'
import { Permission } from '@inspetor/permission'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function PermissionWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  if (!session?.user.role) {
    return null
  }

  if (Permission.canNotAccess(session.user.role, pathname)) {
    router.push('/access-denied')
  }

  return <>{children}</>
}
