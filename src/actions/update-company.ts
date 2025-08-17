'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateCompanyAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyId: z.string(),
      name: z.string(),
      cnpj: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    await prisma.company.update({
      where: {
        id: input.companyId,
      },
      data: {
        name: input.name,
        cnpj: input.cnpj,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Empresa atualizada com sucesso',
      success: true,
    })
  })
