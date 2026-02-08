'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateValveAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      valveId: z.string(),
      companyId: z.string().optional(),
      serialNumber: z.string(),
      model: z.string(),
      diameter: z.string(),
      flow: z.string(),
      openingPressure: z.string(),
      closingPressure: z.string(),
      tests: z.any().optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const valve = await prisma.valve.findUnique({
      where: { id: input.valveId },
      select: { id: true, companyId: true },
    })

    if (!valve) {
      return returnsDefaultActionMessage({
        message: 'Válvula não encontrada',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectValve = subject('ReportValve', {
      companyId: valve.companyId,
    }) as unknown as Subjects
    if (!ability.can('update', subjectValve)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para editar válvula',
        success: false,
      })
    }

    const isAdmin = ctx.user.role === 'ADMIN'
    const newCompanyId =
      isAdmin && input.companyId ? input.companyId : undefined

    if (newCompanyId) {
      const subjectNewCompany = subject('ReportValve', {
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

    await prisma.valve.update({
      where: { id: input.valveId },
      data: {
        ...(newCompanyId ? { companyId: newCompanyId } : {}),
        serialNumber: input.serialNumber,
        model: input.model,
        diameter: input.diameter,
        flow: input.flow,
        openingPressure: input.openingPressure,
        closingPressure: input.closingPressure,
        tests: input.tests ?? {},
      },
    })

    return returnsDefaultActionMessage({
      message: 'Válvula atualizada com sucesso',
      success: true,
    })
  })
