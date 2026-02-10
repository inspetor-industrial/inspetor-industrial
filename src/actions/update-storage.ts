'use server'

import { UserRole } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateStorageAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      storageId: z.string(),
      companyId: z.string().optional(),
      relativeLink: z.string(),
      unitScope: z.enum(['all', 'restricted']),
      unitIds: z.array(z.string()),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const existing = await prisma.storage.findUnique({
      where: { id: input.storageId },
    })

    if (!existing) {
      return returnsDefaultActionMessage({
        message: 'Pasta não encontrada',
        success: false,
      })
    }

    const isAdmin = ctx.user.role === UserRole.ADMIN
    const organizationId = ctx.user.organization?.id ?? ctx.user.companyId

    if (!isAdmin && existing.companyId !== organizationId) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para atualizar esta pasta',
        success: false,
      })
    }

    const resolvedCompanyId =
      isAdmin && input.companyId != null && input.companyId !== ''
        ? input.companyId
        : existing.companyId

    if (
      isAdmin &&
      input.companyId &&
      input.companyId !== existing.companyId
    ) {
      const company = await prisma.company.findUnique({
        where: { id: input.companyId },
      })
      if (!company) {
        return returnsDefaultActionMessage({
          message: 'Empresa não encontrada',
          success: false,
        })
      }
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

    await prisma.storage.update({
      where: { id: input.storageId },
      data: {
        companyId: resolvedCompanyId,
        relativeLink,
      },
    })

    await prisma.storageUnit.deleteMany({
      where: { storageId: input.storageId },
    })
    if (resolvedUnitIds.length > 0) {
      await prisma.storageUnit.createMany({
        data: resolvedUnitIds.map((unitId: string) => ({
          storageId: input.storageId,
          unitId,
        })),
      })
    }

    return returnsDefaultActionMessage({
      message: 'Pasta atualizada com sucesso',
      success: true,
    })
  })
