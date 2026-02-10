'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export type UserUnitAccessResult = {
  scope: 'all' | 'restricted'
  allowedUnitIds: string[]
  defaultUnitId: string | null
}

export const getUserUnitAccessAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      userId: z.string(),
      companyId: z.string(),
    }),
  )
  .handler(async ({ input, ctx }): Promise<UserUnitAccessResult | null> => {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, companyId: true, defaultUnitId: true },
    })

    if (!user) {
      return null
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectUser = subject('User', {
      companyId: user.companyId ?? '',
    }) as unknown as Subjects
    if (!ability.can('update', subjectUser)) {
      return null
    }

    const accessRows = await prisma.userUnitAccess.findMany({
      where: {
        userId: input.userId,
        companyId: input.companyId,
      },
      select: { unitId: true },
    })

    const hasFullAccess = accessRows.some((r) => r.unitId === null)
    const allowedUnitIds = accessRows
      .filter((r): r is { unitId: string } => r.unitId !== null)
      .map((r) => r.unitId)

    if (hasFullAccess) {
      return {
        scope: 'all',
        allowedUnitIds: [],
        defaultUnitId: user.defaultUnitId ?? null,
      }
    }

    return {
      scope: 'restricted',
      allowedUnitIds,
      defaultUnitId: user.defaultUnitId ?? null,
    }
  })
