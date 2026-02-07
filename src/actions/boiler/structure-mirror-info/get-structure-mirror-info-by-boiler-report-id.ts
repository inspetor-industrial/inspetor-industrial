'use server'

import { Prisma } from '@inspetor/generated/prisma/client'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export type StructureMirrorInfoWithRelations =
  Prisma.StructureMirrorInfoGetPayload<object>

export const getStructureMirrorInfoByBoilerReportIdAction = authProcedure
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

      const mirrorInfo = await prisma.structureMirrorInfo.findUnique({
        where: {
          boilerReportId: input.boilerReportId,
        },
      })

      if (!mirrorInfo) {
        return returnsDefaultActionMessage({
          message:
            'Informações do espelho da caldeira não encontradas para este relatório',
          success: false,
        })
      }

      return returnsDefaultActionMessage({
        message: 'Informações do espelho da caldeira encontradas com sucesso',
        success: true,
        data: mirrorInfo as StructureMirrorInfoWithRelations,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar informações do espelho da caldeira',
        success: false,
      })
    }
  })
