'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createValveAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      serialNumber: z.string(),
      model: z.string(),
      diameter: z.string(),
      flow: z.string(),
      openingPressure: z.string(),
      closingPressure: z.string(),
      tests: z.any().optional(),
      companyId: z.string().optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const isAdmin = ctx.user.role === 'ADMIN'
    const resolvedCompanyId =
      isAdmin && input.companyId
        ? input.companyId
        : (ctx.user.organization?.id ?? undefined)

    if (!resolvedCompanyId) {
      return returnsDefaultActionMessage({
        message: isAdmin
          ? 'Selecione a empresa para criar a válvula'
          : 'Empresa não encontrada',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const scope = subject('ReportValve', {
      companyId: resolvedCompanyId,
    }) as unknown as Subjects
    if (!ability.can('create', scope)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para criar válvula',
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

    const valve = await prisma.valve.findFirst({
      where: { serialNumber: input.serialNumber },
      select: { id: true },
    })

    if (valve) {
      return returnsDefaultActionMessage({
        message: 'Válvula já existe com este número de série',
        success: false,
      })
    }

    await prisma.valve.create({
      data: {
        serialNumber: input.serialNumber,
        model: input.model,
        diameter: input.diameter,
        flow: input.flow,
        openingPressure: input.openingPressure,
        closingPressure: input.closingPressure,
        tests: input.tests ?? {},
        companyId: resolvedCompanyId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Válvula criada com sucesso',
      success: true,
    })
  })
