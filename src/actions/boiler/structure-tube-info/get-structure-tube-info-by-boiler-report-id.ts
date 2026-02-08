'use server'

import { Prisma } from '@inspetor/generated/prisma/client'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export type StructureTubeInfoWithRelations =
  Prisma.StructureTubeInfoGetPayload<{
    include: {
      certificate: {
        include: {
          document: true
        }
      }
    }
  }>

export const getStructureTubeInfoByBoilerReportIdAction = authProcedure
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

      const structureTubeInfo =
        await prisma.structureTubeInfo.findUnique({
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

      if (!structureTubeInfo) {
        return returnsDefaultActionMessage({
          message:
            'Informações da estrutura dos tubos não encontradas para este relatório',
          success: false,
        })
      }

      return returnsDefaultActionMessage({
        message: 'Informações da estrutura dos tubos encontradas com sucesso',
        success: true,
        data: structureTubeInfo as StructureTubeInfoWithRelations,
      })
    } catch {
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar informações da estrutura dos tubos',
        success: false,
      })
    }
  })
