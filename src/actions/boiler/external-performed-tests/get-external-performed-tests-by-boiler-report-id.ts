'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const getExternalPerformedTestsByBoilerReportIdAction = authProcedure
  .createServerAction()
  .input(z.object({ boilerReportId: z.string() }))
  .handler(async ({ input, ctx }) => {
    try {
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

      const externalPerformedTests =
        await prisma.externalPerformedTests.findUnique({
          where: {
            boilerReportId: input.boilerReportId,
          },
        })

      return returnsDefaultActionMessage({
        message: externalPerformedTests
          ? 'Dados dos testes externos encontrados com sucesso'
          : 'Nenhum dado dos testes externos salvo ainda',
        success: true,
        data: externalPerformedTests,
      })
    } catch {
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar dados dos testes externos',
        success: false,
      })
    }
  })
