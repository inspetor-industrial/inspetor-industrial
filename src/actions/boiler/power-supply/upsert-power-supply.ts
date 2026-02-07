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

export const upsertPowerSupplyAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      tests: testsSchema,
      observations: z.string().optional().nullable(),
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

      await prisma.powerSupply.upsert({
        where: {
          boilerReportId: input.boilerReportId,
        },
        create: {
          boilerReportId: input.boilerReportId,
          tests: input.tests as object,
          observations: input.observations ?? null,
        },
        update: {
          tests: input.tests as object,
          observations: input.observations ?? null,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Dados da alimentação elétrica salvos com sucesso',
        success: true,
      })
    } catch (error) {
      return returnsDefaultActionMessage({
        message: `Erro ao salvar dados da alimentação elétrica, ${error}`,
        success: false,
      })
    }
  })
