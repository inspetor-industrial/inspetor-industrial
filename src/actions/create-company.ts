'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createCompanyAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string(),
      cnpj: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    await prisma.company.create({
      data: {
        name: input.name,
        cnpj: input.cnpj,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Empresa criada com sucesso',
      success: true,
    })
  })
