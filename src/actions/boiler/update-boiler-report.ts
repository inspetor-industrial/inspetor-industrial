'use server'

import { subject } from '@casl/ability'
import { type Subjects, defineAbilityFor } from '@inspetor/casl/ability'
import type { AuthUser } from '@inspetor/types/auth'
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
      const boilerReport = await prisma.boilerReport.findUnique({
        where: { id: input.boilerReportId },
        select: { id: true, companyId: true },
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
      if (!ability.can('update', subjectReport)) {
        return returnsDefaultActionMessage({
          message: 'Sem permissão para editar relatório de inspeção de caldeira',
          success: false,
        })
      }

      const isAdmin = ctx.user.role === 'ADMIN'
      const newCompanyId = isAdmin && input.companyId ? input.companyId : undefined

      if (newCompanyId) {
        const subjectNewCompany = subject('ReportBoiler', {
          companyId: newCompanyId,
        }) as unknown as Subjects
        const canAssignToNewCompany = ability.can('update', subjectNewCompany)
        if (!canAssignToNewCompany) {
          return returnsDefaultActionMessage({
            message: 'Sem permissão para atribuir a esta empresa',
            success: false,
          })
        }
        const companyExists = await prisma.company.findUnique({
          where: { id: newCompanyId },
          select: { id: true },
        })
        if (!companyExists) {
          return returnsDefaultActionMessage({
            message: 'Empresa não encontrada',
            success: false,
          })
        }
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
        where: { id: boilerReportId },
        data: {
          ...(newCompanyId ? { companyId: newCompanyId } : {}),
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
    } catch {
      return returnsDefaultActionMessage({
        message: 'Erro ao atualizar relatório de inspeção de caldeira',
        success: false,
      })
    }
  })
