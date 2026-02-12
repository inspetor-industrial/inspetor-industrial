'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const getCalibrationOrderByBoilerReportIdAction = authProcedure
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

      const calibrationOrder = await prisma.calibrationOrder.findUnique({
        where: {
          boilerReportId: input.boilerReportId,
        },
      })

      return returnsDefaultActionMessage({
        message: calibrationOrder
          ? 'Dados da ordem de calibração encontrados com sucesso'
          : 'Nenhum dado da ordem de calibração salvo ainda',
        success: true,
        data: calibrationOrder,
      })
    } catch (error) {
      console.error(error)

      return returnsDefaultActionMessage({
        message: 'Erro ao buscar ordem de calibração',
        success: false,
      })
    }
  })
