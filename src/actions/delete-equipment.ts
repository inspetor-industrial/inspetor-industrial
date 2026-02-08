'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'
import type { AuthUser } from '@inspetor/types/auth'

import { authProcedure } from './procedures/auth'

export const deleteEquipmentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      equipmentId: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const equipment = await prisma.equipment.findUnique({
      where: { id: input.equipmentId },
      select: { id: true, companyId: true },
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
        'delete',
        subject('MaintenanceEquipment', { companyId: equipment.companyId }),
      )
    ) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para excluir equipamento',
        success: false,
      })
    }

    await prisma.$transaction([
      prisma.dailyMaintenance.deleteMany({
        where: { equipmentId: input.equipmentId },
      }),
      prisma.equipment.delete({
        where: { id: input.equipmentId },
      }),
    ])

    return returnsDefaultActionMessage({
      message: 'Equipamento deletado com sucesso',
      success: true,
    })
  })
