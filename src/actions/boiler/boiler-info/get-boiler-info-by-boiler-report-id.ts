'use server'

import { Prisma } from '@inspetor/generated/prisma/client'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export type BoilerInfoWithRelations = Prisma.BoilerInfoGetPayload<object>

export const getBoilerInfoByBoilerReportIdAction = authProcedure
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

      const boilerInfo = await prisma.boilerInfo.findUnique({
        where: {
          boilerReportId: input.boilerReportId,
        },
      })

      if (!boilerInfo) {
        return returnsDefaultActionMessage({
          message:
            'Informações da caldeira não encontradas para este relatório',
          success: false,
        })
      }

      return returnsDefaultActionMessage({
        message: 'Informações da caldeira encontradas com sucesso',
        success: true,
        data: boilerInfo as BoilerInfoWithRelations,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar informações da caldeira',
        success: false,
      })
    }
  })
