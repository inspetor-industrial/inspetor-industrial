'use server'

import { subject } from '@casl/ability'
import { type Subjects, defineAbilityFor } from '@inspetor/casl/ability'
import type { AuthUser } from '@inspetor/types/auth'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createBombAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyId: z.string().optional(),
      mark: z.string(),
      model: z.string(),
      stages: z.string(),
      potency: z.string(),
      photoId: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const isAdmin = ctx.user.role === 'ADMIN'
    const resolvedCompanyId =
      isAdmin && input.companyId
        ? input.companyId
        : ctx.user.organization?.id ?? undefined

    if (!resolvedCompanyId) {
      return returnsDefaultActionMessage({
        message: isAdmin
          ? 'Selecione a empresa para criar a bomba'
          : 'Empresa não encontrada',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const scope = subject('ReportBomb', {
      companyId: resolvedCompanyId,
    }) as unknown as Subjects
    if (!ability.can('create', scope)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para criar bomba',
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

    // Photo is created with the uploading user's companyId (see /api/storage).
    // When ADMIN selects another company, allow photo from either the selected
    // company or the admin's organization so uploads still work.
    const allowedCompanyIds = [resolvedCompanyId]
    const orgId = ctx.user.organization?.id
    if (isAdmin && orgId && orgId !== resolvedCompanyId) {
      allowedCompanyIds.push(orgId)
    }

    const photo = await prisma.documents.findFirst({
      where: {
        id: input.photoId,
        companyId: { in: allowedCompanyIds },
      },
    })

    if (!photo) {
      return returnsDefaultActionMessage({
        message: 'Foto não encontrada',
        success: false,
      })
    }

    await prisma.bomb.create({
      data: {
        mark: input.mark,
        model: input.model,
        stages: input.stages,
        potency: input.potency,
        photoId: input.photoId,
        companyId: resolvedCompanyId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Bomba criada com sucesso',
      success: true,
    })
  })
