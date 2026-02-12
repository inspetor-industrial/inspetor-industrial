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

export const upsertHydrostaticTestAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      tests: testsSchema,
      observations: z.string().optional().nullable(),
      pressure: z.string().optional().nullable(),
      duration: z.string().optional().nullable(),
      procedure: z.string().optional().nullable(),
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

      await prisma.hydrostaticTest.upsert({
        where: {
          boilerReportId: input.boilerReportId,
        },
        create: {
          boilerReportId: input.boilerReportId,
          tests: input.tests as object,
          observations: input.observations ?? null,
          pressure: input.pressure ?? null,
          duration: input.duration ?? null,
          procedure: input.procedure ?? null,
        },
        update: {
          tests: input.tests as object,
          observations: input.observations ?? null,
          pressure: input.pressure ?? null,
          duration: input.duration ?? null,
          procedure: input.procedure ?? null,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Teste hidrostático salvo com sucesso',
        success: true,
      })
    } catch (error) {
      console.error(error)

      return returnsDefaultActionMessage({
        message: 'Erro ao salvar teste hidrostático',
        success: false,
      })
    }
  })
