'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const getPowerSupplyByBoilerReportIdAction = authProcedure
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

      const powerSupply = await prisma.powerSupply.findUnique({
        where: {
          boilerReportId: input.boilerReportId,
        },
      })

      return returnsDefaultActionMessage({
        message: powerSupply
          ? 'Dados da alimentação elétrica encontrados com sucesso'
          : 'Nenhum dado da alimentação elétrica salvo ainda',
        success: true,
        data: powerSupply,
      })
    } catch {
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar dados da alimentação elétrica',
        success: false,
      })
    }
  })
