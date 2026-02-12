'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const getWaterQualityByBoilerReportIdAction = authProcedure
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

      const waterQuality = await prisma.waterQuality.findUnique({
        where: {
          boilerReportId: input.boilerReportId,
        },
      })

      return returnsDefaultActionMessage({
        message: waterQuality
          ? 'Dados da qualidade da água encontrados com sucesso'
          : 'Nenhum dado da qualidade da água salvo ainda',
        success: true,
        data: waterQuality,
      })
    } catch (error) {
      console.error(error)

      return returnsDefaultActionMessage({
        message: 'Erro ao buscar qualidade da água',
        success: false,
      })
    }
  })
