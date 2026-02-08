'use client'

import { useRouter } from '@bprogress/next'
import type { Subjects } from '@inspetor/casl/ability'
import { useAbility } from '@inspetor/casl/context'
import { useSession } from '@inspetor/lib/auth/context'
import { usePathname } from 'next/navigation'

/**
 * Path prefixes that do not require a CASL subject check (any authenticated user can access).
 * Used to preserve legacy behavior where OPERATOR could access e.g. /dashboard/storage/reports
 * (forbidden list used exact match, so only /dashboard/storage was blocked, not /dashboard/storage/reports).
 */
const PATH_PREFIXES_ALLOWED_WITHOUT_SUBJECT = ['/dashboard/storage/reports']

/**
 * Dashboard path prefixes that require read access to a CASL subject.
 * Longest prefixes first so e.g. /dashboard/reports/boiler/creation matches ReportBoiler.
 * /dashboard/storage/reports is not here; it is allowed without subject (see above).
 */
const PATH_SUBJECT_MAP: { pathPrefix: string; subject: Subjects }[] = [
  { pathPrefix: '/dashboard/reports/boiler', subject: 'ReportBoiler' },
  {
    pathPrefix: '/dashboard/maintenance/equipment',
    subject: 'MaintenanceEquipment',
  },
  { pathPrefix: '/dashboard/maintenance/daily', subject: 'MaintenanceDaily' },
  { pathPrefix: '/dashboard/company', subject: 'Company' },
  { pathPrefix: '/dashboard/storage', subject: 'Storage' },
  { pathPrefix: '/dashboard/users', subject: 'User' },
  { pathPrefix: '/dashboard/client', subject: 'Client' },
  { pathPrefix: '/dashboard/instruments', subject: 'Instruments' },
  { pathPrefix: '/dashboard/documents', subject: 'Documents' },
  { pathPrefix: '/dashboard/valve', subject: 'ReportValve' },
  { pathPrefix: '/dashboard/bomb', subject: 'ReportBomb' },
]

function getSubjectForPath(pathname: string): Subjects | null {
  const allowedWithoutSubject = PATH_PREFIXES_ALLOWED_WITHOUT_SUBJECT.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
  if (allowedWithoutSubject) {
    return null
  }

  for (const { pathPrefix, subject } of PATH_SUBJECT_MAP) {
    if (pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`)) {
      return subject
    }
  }
  return null
}

export function PermissionWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const ability = useAbility()

  if (!session?.user) {
    return null
  }

  const subject = getSubjectForPath(pathname)
  if (subject !== null && !ability.can('read', subject)) {
    router.push('/access-denied')
    return null
  }

  return <>{children}</>
}
