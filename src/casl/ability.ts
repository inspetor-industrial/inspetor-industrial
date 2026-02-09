import type { ConditionsMatcher } from '@casl/ability'
import { AbilityBuilder, PureAbility } from '@casl/ability'
import { UserResponsibility, UserRole } from '@inspetor/generated/prisma/enums'
import type { AuthUser } from '@inspetor/types/auth'

/** Matches objects that have the same values as conditions (e.g. { companyId }) for scope checks. */
const scopeConditionsMatcher: ConditionsMatcher<unknown> =
  (conditions) => (object: unknown) =>
    Boolean(
      object &&
      typeof object === 'object' &&
      !Array.isArray(object) &&
      conditions &&
      typeof conditions === 'object' &&
      !Array.isArray(conditions) &&
      Object.keys(conditions).every(
        (key) =>
          Object.prototype.hasOwnProperty.call(object, key) &&
          (object as Record<string, unknown>)[key] ===
            (conditions as Record<string, unknown>)[key],
      ),
    )

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type Subjects =
  | 'Company'
  | 'Client'
  | 'Storage'
  | 'User'
  | 'Instruments'
  | 'Documents'
  | 'MaintenanceDaily'
  | 'MaintenanceEquipment'
  | 'ReportBoiler'
  | 'ReportValve'
  | 'ReportBomb'
  | 'all'

export type AppAbility = PureAbility<[Actions, Subjects]>

const COMPANY_SCOPED_SUBJECTS: Subjects[] = [
  'Company',
  'Client',
  'Storage',
  'User',
  'Instruments',
  'Documents',
  'MaintenanceDaily',
  'MaintenanceEquipment',
]

/** Operator is read-only for these subjects (view only; no create, update, or delete). */
const OPERATOR_READ_SUBJECTS: Subjects[] = [
  'MaintenanceDaily',
  'MaintenanceEquipment',
]

const REPORT_SUBJECTS: Subjects[] = [
  'ReportBoiler',
  'ReportValve',
  'ReportBomb',
]

const ALL_SUBJECTS: Subjects[] = [
  ...COMPANY_SCOPED_SUBJECTS,
  ...REPORT_SUBJECTS,
]

const CRUD_ACTIONS: Actions[] = ['create', 'read', 'update', 'delete']

export function createEmptyAbility(): AppAbility {
  const { build } = new AbilityBuilder(
    PureAbility as unknown as typeof PureAbility<[Actions, Subjects]>,
  )
  return build() as AppAbility
}

export function defineAbilityFor(user: AuthUser): AppAbility {
  const { can, build } = new AbilityBuilder(
    PureAbility as unknown as typeof PureAbility<[Actions, Subjects]>,
  )

  const abilityOptions = { conditionsMatcher: scopeConditionsMatcher }

  if (!user.role) {
    return build(abilityOptions) as AppAbility
  }

  if (user.role === UserRole.ADMIN) {
    can('manage', 'all')
    return build(abilityOptions) as AppAbility
  }

  const companyId = user.companyId ?? null
  if (!companyId) {
    return createEmptyAbility()
  }

  const scope = { companyId } as const
  const responsibility = user.responsibility ?? UserResponsibility.OPERATOR

  if (responsibility === UserResponsibility.OPERATOR) {
    for (const subject of OPERATOR_READ_SUBJECTS) {
      can('read', subject, scope)
    }
    // Operator can manage (CRUD) DailyMaintenance only; read-only on MaintenanceEquipment
    can('manage', 'MaintenanceDaily', scope)
    return build(abilityOptions) as AppAbility
  }

  if (responsibility === UserResponsibility.SECRETARY) {
    for (const subject of COMPANY_SCOPED_SUBJECTS) {
      can(CRUD_ACTIONS, subject, scope)
    }
    for (const subject of REPORT_SUBJECTS) {
      can(['read', 'update', 'delete'], subject, scope)
    }
    return build(abilityOptions) as AppAbility
  }

  if (responsibility === UserResponsibility.ENGINEER) {
    for (const subject of ALL_SUBJECTS) {
      can(CRUD_ACTIONS, subject, scope)
    }
    return build(abilityOptions) as AppAbility
  }

  return build(abilityOptions) as AppAbility
}
