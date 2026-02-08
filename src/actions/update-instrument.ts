'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateInstrumentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      instrumentId: z.string(),
      companyId: z.string().optional(),
      type: z.string(),
      manufacturer: z.string(),
      serialNumber: z.string(),
      certificateNumber: z.string(),
      validationDate: z.object({ month: z.string(), year: z.string() }),
    }),
  )
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
    if (!ability.can('update', subjectInstrument)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para editar instrumento',
        success: false,
      })
    }

    const isAdmin = ctx.user.role === 'ADMIN'
    const newCompanyId =
      isAdmin && input.companyId ? input.companyId : undefined

    if (newCompanyId) {
      const subjectNewCompany = subject('Instruments', {
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

    await prisma.instruments.update({
      where: { id: input.instrumentId },
      data: {
        ...(newCompanyId ? { companyId: newCompanyId } : {}),
        type: input.type,
        manufacturer: input.manufacturer,
        serialNumber: input.serialNumber,
        certificateNumber: input.certificateNumber,
        validationDate: new Date(
          `20${input.validationDate.year?.trim()}-${input.validationDate.month?.trim()}-01`,
        ),
      },
    })

    return returnsDefaultActionMessage({
      message: 'Instrumento atualizado com sucesso',
      success: true,
    })
  })
