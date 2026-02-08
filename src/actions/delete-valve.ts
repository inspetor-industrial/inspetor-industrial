'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteValveAction = authProcedure
  .createServerAction()
  .input(z.object({ valveId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const valve = await prisma.valve.findUnique({
      where: { id: input.valveId },
      select: { id: true, companyId: true },
    })

    if (!valve) {
      return returnsDefaultActionMessage({
        message: 'Válvula não encontrada',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectValve = subject('ReportValve', {
      companyId: valve.companyId,
    }) as unknown as Subjects
    if (!ability.can('delete', subjectValve)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para excluir válvula',
        success: false,
      })
    }

    await prisma.valve.delete({
      where: { id: input.valveId },
    })

    return returnsDefaultActionMessage({
      message: 'Válvula deletada com sucesso',
      success: true,
    })
  })
