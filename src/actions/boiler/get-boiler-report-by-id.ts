'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { Prisma } from '@inspetor/generated/prisma/client'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
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
        where: { id: input.boilerReportId },
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

      const ability = defineAbilityFor(ctx.user as AuthUser)
      const subjectReport = subject('ReportBoiler', {
        companyId: boilerReport.companyId,
      }) as unknown as Subjects
      if (!ability.can('read', subjectReport)) {
        return returnsDefaultActionMessage({
          message: 'Sem permissão para visualizar este relatório',
          success: false,
        })
      }

      return returnsDefaultActionMessage({
        message: 'Relatório de inspeção de caldeira encontrado com sucesso',
        success: true,
        data: boilerReport as BoilerReportWithRelations,
      })
    } catch {
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar relatório de inspeção de caldeira',
        success: false,
      })
    }
  })
