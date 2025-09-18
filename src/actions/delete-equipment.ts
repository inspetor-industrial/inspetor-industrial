'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteEquipmentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      equipmentId: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    if (!ctx.user.organization.id) {
      return returnsDefaultActionMessage({
        message: 'Usuário não possui empresa ou não está autenticado',
        success: false,
      })
    }

    const equipment = await prisma.equipment.findUnique({
      where: {
        id: input.equipmentId,
        companyId: ctx.user.organization.id,
      },
    })

    if (!equipment) {
      return returnsDefaultActionMessage({
        message: 'Equipamento não encontrado',
        success: false,
      })
    }

    await prisma.equipment.delete({
      where: {
        id: input.equipmentId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Equipamento deletado com sucesso',
      success: true,
    })
  })
