'use server'

import { UserRole } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const registerStorageAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyId: z.string().optional(),
      relativeLink: z.string(),
      unitScope: z.enum(['all', 'restricted']),
      unitIds: z.array(z.string()),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const resolvedCompanyId =
      ctx.user.role === UserRole.ADMIN && input.companyId
        ? input.companyId
        : (ctx.user.organization?.id ?? ctx.user.companyId ?? null)

    if (!resolvedCompanyId) {
      return returnsDefaultActionMessage({
        message: 'Empresa é obrigatória para registrar pasta',
        success: false,
      })
    }

    const relativeLink = input.relativeLink.replace(
      'https://drive.google.com/drive/folders',
      '',
    )

    const resolvedUnitIds =
      input.unitScope === 'all' ? [] : (input.unitIds ?? [])

    if (resolvedUnitIds.length > 0) {
      const unitsInCompany = await prisma.companyUnit.findMany({
        where: {
          companyId: resolvedCompanyId,
          id: { in: resolvedUnitIds },
        },
        select: { id: true },
      })
      const validIds = new Set(unitsInCompany.map((u) => u.id))
      const invalid = resolvedUnitIds.filter((id: string) => !validIds.has(id))
      if (invalid.length > 0) {
        return returnsDefaultActionMessage({
          message:
            'Uma ou mais unidades não pertencem à empresa selecionada.',
          success: false,
        })
      }
    }

    const created = await prisma.storage.create({
      data: {
        companyId: resolvedCompanyId,
        relativeLink,
      },
    })

    if (resolvedUnitIds.length > 0) {
      await prisma.storageUnit.createMany({
        data: resolvedUnitIds.map((unitId: string) => ({
          storageId: created.id,
          unitId,
        })),
      })
    }

    return returnsDefaultActionMessage({
      message: 'Pasta registrada com sucesso',
      success: true,
    })
  })
