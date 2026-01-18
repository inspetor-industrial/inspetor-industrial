'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createBoilerReportAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      type: z.enum(['INITIAL', 'PERIODIC', 'EXTRAORDINARY']),
      clientId: z.string(),
      motivation: z.string().optional(),
      date: z.date(),
      startTimeOfInspection: z.string(),
      endTimeOfInspection: z.string(),
      inspectionValidation: z.string().optional(),
      nextInspectionDate: z.date(),
      engineerId: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    try {
      const {
        type,
        clientId,
        motivation,
        date,
        startTimeOfInspection,
        endTimeOfInspection,
        inspectionValidation,
        nextInspectionDate,
        engineerId,
      } = input

      await prisma.boilerReport.create({
        data: {
          type,
          clientId,
          motivation,
          date,
          startTimeOfInspection,
          endTimeOfInspection,
          inspectionValidation,
          nextInspectionDate,
          engineerId,
          companyId: ctx.user.organization.id,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Relatório de inspeção de caldeira criado com sucesso',
        success: true,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message: 'Erro ao criar relatório de inspeção de caldeira',
        success: false,
      })
    }
  })
