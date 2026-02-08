'use server'

import { StructureFurnaceType } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const upsertStructureFurnaceInfoAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),

      heatingSurface: z.number().optional().nullable(),
      surfaceType: z.enum(StructureFurnaceType),

      width: z.number().optional().nullable(),
      height: z.number().optional().nullable(),
      length: z.number().optional().nullable(),
      diameter: z.number().optional().nullable(),

      tubeDiameter: z.number().optional().nullable(),
      tubeThickness: z.number().optional().nullable(),

      freeLengthWithoutStays: z.number().optional().nullable(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    try {
      const organizationId = ctx.user.organization?.id
      if (!organizationId) {
        return returnsDefaultActionMessage({
          message: 'Organização não encontrada',
          success: false,
        })
      }

      const { boilerReportId, ...data } = input

      const boilerReport = await prisma.boilerReport.findUnique({
        where: {
          id: boilerReportId,
          companyId: organizationId,
        },
      })

      if (!boilerReport) {
        return returnsDefaultActionMessage({
          message: 'Relatório de inspeção de caldeira não encontrado',
          success: false,
        })
      }

      await prisma.structureFurnaceInfo.upsert({
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
        message: 'Informações da fornalha salvas com sucesso',
        success: true,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message:
          'Erro ao salvar informações da fornalha, ' +
          (error instanceof Error ? error.message : String(error)),
        success: false,
      })
    }
  })
