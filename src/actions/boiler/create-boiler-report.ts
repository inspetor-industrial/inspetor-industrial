'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { BoilerReportType } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export const createBoilerReportAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyId: z.string().optional(),
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
      const isAdmin = ctx.user.role === 'ADMIN'
      const resolvedCompanyId =
        isAdmin && input.companyId
          ? input.companyId
          : (ctx.user.organization?.id ?? undefined)

      if (!resolvedCompanyId) {
        return returnsDefaultActionMessage({
          message: isAdmin
            ? 'Selecione a empresa para criar o relatório'
            : 'Empresa não encontrada',
          success: false,
        })
      }

      const ability = defineAbilityFor(ctx.user as AuthUser)
      const scope = subject('ReportBoiler', {
        companyId: resolvedCompanyId,
      }) as unknown as Subjects
      if (!ability.can('create', scope)) {
        return returnsDefaultActionMessage({
          message: 'Sem permissão para criar relatório de inspeção de caldeira',
          success: false,
        })
      }

      const companyExists = await prisma.company.findUnique({
        where: { id: resolvedCompanyId },
        select: { id: true },
      })
      if (!companyExists) {
        return returnsDefaultActionMessage({
          message: 'Empresa não encontrada',
          success: false,
        })
      }

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
          companyId: resolvedCompanyId,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Relatório de inspeção de caldeira criado com sucesso',
        success: true,
      })
    } catch {
      return returnsDefaultActionMessage({
        message: 'Erro ao criar relatório de inspeção de caldeira',
        success: false,
      })
    }
  })
