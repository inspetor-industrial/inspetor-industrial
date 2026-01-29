'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export const deleteBoilerReportAction = authProcedure
  .createServerAction()
  .input(z.object({ boilerReportId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const boilerReport = await prisma.boilerReport.findUnique({
      where: {
        id: input.boilerReportId,
        companyId: ctx.user.organization.id,
      },
    })

    if (!boilerReport) {
      return returnsDefaultActionMessage({
        message: 'Relatório de inspeção de caldeira não encontrado',
        success: false,
      })
    }

    await prisma.boilerReport.delete({
      where: {
        id: input.boilerReportId,
        companyId: ctx.user.organization.id,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Relatório de inspeção de caldeira deletado com sucesso',
      success: true,
    })
  })
