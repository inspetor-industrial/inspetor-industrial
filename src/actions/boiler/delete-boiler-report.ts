'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export const deleteBoilerReportAction = authProcedure
  .createServerAction()
  .input(z.object({ boilerReportId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const boilerReport = await prisma.boilerReport.findUnique({
      where: { id: input.boilerReportId },
      select: { id: true, companyId: true },
    })

    if (!boilerReport) {
      return returnsDefaultActionMessage({
        message: 'Relatório de inspeção de caldeira não encontrado',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectReport = subject('ReportBoiler', {
      companyId: boilerReport.companyId,
    }) as unknown as Subjects
    if (!ability.can('delete', subjectReport)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para excluir relatório de inspeção de caldeira',
        success: false,
      })
    }

    await prisma.boilerReport.delete({
      where: { id: input.boilerReportId },
    })

    return returnsDefaultActionMessage({
      message: 'Relatório de inspeção de caldeira deletado com sucesso',
      success: true,
    })
  })
