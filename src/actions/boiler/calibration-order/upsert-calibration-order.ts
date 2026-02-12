'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

const testsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      answer: z.enum(['yes', 'no']).or(z.literal('')),
    }),
  ),
  nrs: z.array(
    z.object({
      parent: z.string(),
      parentSelected: z.boolean(),
      children: z.array(
        z.object({
          selected: z.boolean(),
          text: z.string(),
        }),
      ),
    }),
  ),
})

export const upsertCalibrationOrderAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      tests: testsSchema,
      observations: z.string().optional().nullable(),
      capacity: z.string().optional().nullable(),
      diameter: z.string().optional().nullable(),
      mark: z.string().optional().nullable(),
      serialNumber: z.string().optional().nullable(),
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

      await prisma.calibrationOrder.upsert({
        where: {
          boilerReportId: input.boilerReportId,
        },
        create: {
          boilerReportId: input.boilerReportId,
          tests: input.tests as object,
          observations: input.observations ?? null,
          capacity: input.capacity ?? null,
          diameter: input.diameter ?? null,
          mark: input.mark ?? null,
          serialNumber: input.serialNumber ?? null,
        },
        update: {
          tests: input.tests as object,
          observations: input.observations ?? null,
          capacity: input.capacity ?? null,
          diameter: input.diameter ?? null,
          mark: input.mark ?? null,
          serialNumber: input.serialNumber ?? null,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Ordem de calibração salva com sucesso',
        success: true,
      })
    } catch (error) {
      console.error(error)

      return returnsDefaultActionMessage({
        message: 'Erro ao salvar ordem de calibração',
        success: false,
      })
    }
  })
