'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createInstrumentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyId: z.string().optional(),
      type: z.string(),
      manufacturer: z.string(),
      serialNumber: z.string(),
      certificateNumber: z.string(),
      validationDate: z.object({
        month: z.string(),
        year: z.string(),
      }),
    }),
  )
  .handler(async ({ input, ctx }) => {
    if (!ctx?.user?.email) {
      return returnsDefaultActionMessage({
        message: 'Usuário não autenticado',
        success: false,
      })
    }

    const isAdmin = ctx.user.role === 'ADMIN'
    const resolvedCompanyId =
      isAdmin && input.companyId
        ? input.companyId
        : (ctx.user.organization?.id ?? undefined)

    if (!resolvedCompanyId) {
      return returnsDefaultActionMessage({
        message: isAdmin
          ? 'Selecione a empresa para criar o instrumento'
          : 'Empresa não encontrada',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const scope = subject('Instruments', {
      companyId: resolvedCompanyId,
    }) as unknown as Subjects
    if (!ability.can('create', scope)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para criar instrumento',
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

    const instrument = await prisma.instruments.findFirst({
      where: {
        OR: [
          { serialNumber: input.serialNumber },
          { certificateNumber: input.certificateNumber },
        ],
      },
    })

    if (instrument) {
      return returnsDefaultActionMessage({
        message: 'Instrumento já existe',
        success: false,
      })
    }

    await prisma.instruments.create({
      data: {
        type: input.type,
        manufacturer: input.manufacturer,
        serialNumber: input.serialNumber,
        certificateNumber: input.certificateNumber,
        validationDate: new Date(
          `20${input.validationDate.year?.trim()}-${input.validationDate.month?.trim()}-01`,
        ),
        companyId: resolvedCompanyId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Instrumento criado com sucesso',
      success: true,
    })
  })
