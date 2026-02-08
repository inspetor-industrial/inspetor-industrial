'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'
import type { AuthUser } from '@inspetor/types/auth'

import { authProcedure } from './procedures/auth'

export const registerMaintenanceAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      equipmentId: z.string(),
      operatorName: z.string(),
      description: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const equipment = await prisma.equipment.findUnique({
      where: { id: input.equipmentId },
      select: { companyId: true },
    })

    if (!equipment) {
      return returnsDefaultActionMessage({
        message: 'Equipamento não encontrado',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    if (
      !ability.can(
        'create',
        subject('MaintenanceDaily', { companyId: equipment.companyId }),
      )
    ) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para registrar manutenção diária neste equipamento',
        success: false,
      })
    }

    await prisma.dailyMaintenance.create({
      data: {
        companyId: equipment.companyId,
        equipmentId: input.equipmentId,
        operatorName: input.operatorName,
        description: input.description,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Manutenção registrada com sucesso',
      success: true,
    })
  })
