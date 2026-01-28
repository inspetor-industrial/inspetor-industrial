'use server'

import { BoilerReportType } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export const updateBoilerReportAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      type: z.enum(BoilerReportType),
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

      const {
        boilerReportId,
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

      await prisma.boilerReport.update({
        where: {
          id: boilerReportId,
          companyId: ctx.user.organization.id,
        },
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
        },
      })

      return returnsDefaultActionMessage({
        message: 'Relatório de inspeção de caldeira atualizado com sucesso',
        success: true,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message: 'Erro ao atualizar relatório de inspeção de caldeira',
        success: false,
      })
    }
  })
