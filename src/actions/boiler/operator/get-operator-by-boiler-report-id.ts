'use server'

import { Prisma } from '@inspetor/generated/prisma/client'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export type OperatorWithRelations = Prisma.OperatorGetPayload<{
  include: {
    certificate: {
      include: {
        document: true
      }
    }
  }
}>

export const getOperatorByBoilerReportIdAction = authProcedure
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

      const operator = await prisma.operator.findUnique({
        where: {
          boilerReportId: input.boilerReportId,
        },
        include: {
          certificate: {
            include: {
              document: true,
            },
          },
        },
      })

      if (!operator) {
        return returnsDefaultActionMessage({
          message: 'Operador não encontrado para este relatório',
          success: false,
        })
      }

      return returnsDefaultActionMessage({
        message: 'Operador encontrado com sucesso',
        success: true,
        data: operator as OperatorWithRelations,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar operador',
        success: false,
      })
    }
  })
