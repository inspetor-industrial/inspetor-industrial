'use server'

import { InjectorGaugeFuel } from '@inspetor/generated/prisma/enums'
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

export const upsertInjectorGaugeAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      tests: testsSchema,
      observations: z.string().optional().nullable(),
      fuelType: z.nativeEnum(InjectorGaugeFuel),
      mark: z.string(),
      diameter: z.string(),
      serialNumber: z.string(),
    }),
  )
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

      await prisma.injectorGauge.upsert({
        where: {
          boilerReportId: input.boilerReportId,
        },
        create: {
          boilerReportId: input.boilerReportId,
          tests: input.tests as object,
          observations: input.observations ?? null,
          fuelType: input.fuelType,
          mark: input.mark,
          diameter: input.diameter,
          serialNumber: input.serialNumber,
        },
        update: {
          tests: input.tests as object,
          observations: input.observations ?? null,
          fuelType: input.fuelType,
          mark: input.mark,
          diameter: input.diameter,
          serialNumber: input.serialNumber,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Dados do injetor salvos com sucesso',
        success: true,
      })
    } catch (error) {
      return returnsDefaultActionMessage({
        message:
          'Erro ao salvar dados do injetor, ' +
          (error instanceof Error ? error.message : String(error)),
        success: false,
      })
    }
  })
