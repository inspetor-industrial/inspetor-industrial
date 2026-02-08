'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const upsertBoilerInfoAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      manufacturer: z.string().optional().nullable(),
      mark: z.string().optional().nullable(),
      type: z.string(),
      model: z.string().optional().nullable(),
      yearOfManufacture: z.number().optional().nullable(),
      maximumWorkingPressure: z.string().optional().nullable(),
      maximumOperatingPressure: z.string().optional().nullable(),
      series: z.string().optional().nullable(),
      fuelType: z.string(),
      category: z.string(),
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

      const {
        boilerReportId,
        manufacturer,
        mark,
        type,
        model,
        yearOfManufacture,
        maximumWorkingPressure,
        maximumOperatingPressure,
        series,
        fuelType,
        category,
      } = input

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

      await prisma.boilerInfo.upsert({
        where: {
          boilerReportId,
        },
        create: {
          boilerReportId,
          manufacturer,
          mark,
          type,
          model,
          yearOfManufacture,
          maximumWorkingPressure,
          maximumOperatingPressure,
          series,
          fuelType,
          category,
        },
        update: {
          manufacturer,
          mark,
          type,
          model,
          yearOfManufacture,
          maximumWorkingPressure,
          maximumOperatingPressure,
          series,
          fuelType,
          category,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Informações da caldeira salvas com sucesso',
        success: true,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message:
          'Erro ao salvar informações da caldeira, ' +
          (error instanceof Error ? error.message : String(error)),
        success: false,
      })
    }
  })
