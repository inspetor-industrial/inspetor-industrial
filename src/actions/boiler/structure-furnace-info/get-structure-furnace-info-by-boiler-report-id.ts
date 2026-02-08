'use server'

import { Prisma } from '@inspetor/generated/prisma/client'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export type StructureFurnaceInfoWithRelations =
  Prisma.StructureFurnaceInfoGetPayload<object>

export const getStructureFurnaceInfoByBoilerReportIdAction = authProcedure
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

      const furnaceInfo = await prisma.structureFurnaceInfo.findUnique({
        where: {
          boilerReportId: input.boilerReportId,
        },
      })

      if (!furnaceInfo) {
        return returnsDefaultActionMessage({
          message:
            'Informações da fornalha não encontradas para este relatório',
          success: false,
        })
      }

      return returnsDefaultActionMessage({
        message: 'Informações da fornalha encontradas com sucesso',
        success: true,
        data: furnaceInfo as StructureFurnaceInfoWithRelations,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar informações da fornalha',
        success: false,
      })
    }
  })
