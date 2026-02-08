'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const getGeneralPerformedTestsByBoilerReportIdAction = authProcedure
  .createServerAction()
  .input(z.object({ boilerReportId: z.string() }))
  .handler(async ({ input, ctx }) => {
    try {
      const organizationId = ctx.user.organization?.id
      if (!organizationId) {
        return returnsDefaultActionMessage({
          message: 'Organização não encontrada',
          success: false,
        })
      }

      const boilerReport = await prisma.boilerReport.findUnique({
        where: {
          id: input.boilerReportId,
          companyId: organizationId,
        },
      })

      if (!boilerReport) {
        return returnsDefaultActionMessage({
          message: 'Relatório de inspeção de caldeira não encontrado',
          success: false,
        })
      }

      const generalPerformedTests =
        await prisma.generalPerformedTests.findUnique({
          where: {
            boilerReportId: input.boilerReportId,
          },
        })

      return returnsDefaultActionMessage({
        message: generalPerformedTests
          ? 'Testes gerais encontrados com sucesso'
          : 'Nenhum dado de testes gerais salvo ainda',
        success: true,
        data: generalPerformedTests,
      })
    } catch {
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar testes gerais',
        success: false,
      })
    }
  })
