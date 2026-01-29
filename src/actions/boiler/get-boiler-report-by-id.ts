'use server'

import { Prisma } from '@inspetor/generated/prisma/client'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export type BoilerReportWithRelations = Prisma.BoilerReportGetPayload<{
  include: {
    client: true
    engineer: true
  }
}>

export const getBoilerReportByIdAction = authProcedure
  .createServerAction()
  .input(z.object({ boilerReportId: z.string() }))
  .handler(async ({ input, ctx }) => {
    try {
      const boilerReport = await prisma.boilerReport.findUnique({
        where: {
          id: input.boilerReportId,
          companyId: ctx.user.organization.id,
        },
        include: {
          client: true,
          engineer: true,
        },
      })

      if (!boilerReport) {
        return returnsDefaultActionMessage({
          message: 'Relatório de inspeção de caldeira não encontrado',
          success: false,
        })
      }

      return returnsDefaultActionMessage({
        message: 'Relatório de inspeção de caldeira encontrado com sucesso',
        success: true,
        data: boilerReport as BoilerReportWithRelations,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar relatório de inspeção de caldeira',
        success: false,
      })
    }
  })
