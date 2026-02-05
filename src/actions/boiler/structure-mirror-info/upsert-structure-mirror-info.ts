'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const upsertStructureMirrorInfoAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),

      thickness: z.number().optional().nullable(),
      diameter: z.number().optional().nullable(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    try {
      const { boilerReportId, ...data } = input

      const boilerReport = await prisma.boilerReport.findUnique({
        where: {
          id: boilerReportId,
          companyId: ctx.user.organization.id,
        },
      })

      if (!boilerReport) {
        return returnsDefaultActionMessage({
          message: 'Relatório de inspeção de caldeira não encontrado',
          success: false,
        })
      }

      await prisma.structureMirrorInfo.upsert({
        where: {
          boilerReportId,
        },
        create: {
          boilerReportId,
          ...data,
        },
        update: {
          ...data,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Informações do espelho da caldeira salvas com sucesso',
        success: true,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message:
          'Erro ao salvar informações do espelho da caldeira, ' +
          (error instanceof Error ? error.message : String(error)),
        success: false,
      })
    }
  })
