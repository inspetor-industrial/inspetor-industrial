'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const getInjectorGaugeByBoilerReportIdAction = authProcedure
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

      const injectorGauge = await prisma.injectorGauge.findUnique({
        where: {
          boilerReportId: input.boilerReportId,
        },
      })

      return returnsDefaultActionMessage({
        message: injectorGauge
          ? 'Dados do injetor encontrados com sucesso'
          : 'Nenhum dado do injetor salvo ainda',
        success: true,
        data: injectorGauge,
      })
    } catch {
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar dados do injetor',
        success: false,
      })
    }
  })
