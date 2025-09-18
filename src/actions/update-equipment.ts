'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateEquipmentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      equipmentId: z.string(),
      name: z.string(),
      mark: z.string(),
      type: z.string(),
      identificationNumber: z.string(),
      manufactorYear: z.string(),
      category: z.string(),
      pmta: z.string(),
      model: z.string(),
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

    await prisma.equipment.update({
      where: {
        id: input.equipmentId,
      },
      data: {
        name: input.name,
        mark: input.mark,
        type: input.type,
        identificationNumber: input.identificationNumber,
        manufactorYear: input.manufactorYear,
        category: input.category,
        pmta: input.pmta,
        model: input.model,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Equipamento atualizado com sucesso',
      success: true,
    })
  })
