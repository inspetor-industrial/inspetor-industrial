'use server'

import { subject } from '@casl/ability'
import { type Subjects, defineAbilityFor } from '@inspetor/casl/ability'
import type { AuthUser } from '@inspetor/types/auth'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteInstrumentAction = authProcedure
  .createServerAction()
  .input(z.object({ instrumentId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const instrument = await prisma.instruments.findUnique({
      where: { id: input.instrumentId },
      select: { id: true, companyId: true },
    })

    if (!instrument) {
      return returnsDefaultActionMessage({
        message: 'Instrumento não encontrado',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectInstrument = subject('Instruments', {
      companyId: instrument.companyId,
    }) as unknown as Subjects
    if (!ability.can('delete', subjectInstrument)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para excluir instrumento',
        success: false,
      })
    }

    await prisma.instruments.delete({
      where: { id: input.instrumentId },
    })

    return returnsDefaultActionMessage({
      message: 'Instrumento deletado com sucesso',
      success: true,
    })
  })
