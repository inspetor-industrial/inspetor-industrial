'use server'

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { subject } from '@casl/ability'
import type { AppAbility } from '@inspetor/casl/ability'
import { defineAbilityFor } from '@inspetor/casl/ability'
import { env } from '@inspetor/env'
import { prisma } from '@inspetor/lib/prisma'
import { r2 } from '@inspetor/lib/r2'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateBombAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      bombId: z.string(),
      companyId: z.string().optional(),
      mark: z.string(),
      model: z.string(),
      stages: z.string(),
      potency: z.string(),
      photoId: z.string().optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const bomb = await prisma.bomb.findUnique({
      where: { id: input.bombId },
      include: {
        photo: true,
      },
    })

    if (!bomb) {
      return returnsDefaultActionMessage({
        message: 'Bomba não encontrada',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectBomb = subject('ReportBomb', {
      companyId: bomb.companyId,
    }) as unknown as Parameters<AppAbility['can']>[1]
    if (!ability.can('update', subjectBomb)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para editar bomba',
        success: false,
      })
    }

    const isAdmin = ctx.user.role === 'ADMIN'
    const newCompanyId =
      isAdmin && input.companyId ? input.companyId : undefined

    if (newCompanyId) {
      const subjectNewCompany = subject('ReportBomb', {
        companyId: newCompanyId,
      }) as unknown as Parameters<AppAbility['can']>[1]
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

    const targetCompanyId = newCompanyId ?? bomb.companyId

    // Photo is created with the uploading user's companyId (see /api/storage).
    // When ADMIN edits and changes company or keeps another company, allow photo
    // from target company or from admin's organization.
    if (input.photoId) {
      const allowedCompanyIds = [targetCompanyId]
      const orgId = ctx.user.organization?.id
      if (isAdmin && orgId && orgId !== targetCompanyId) {
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
    }

    if (!input.photoId || input.photoId === '') {
      return returnsDefaultActionMessage({
        message: 'Foto é obrigatória',
        success: false,
      })
    }

    const photoChanged = input.photoId !== bomb.photoId
    const oldPhoto = bomb.photo

    await prisma.bomb.update({
      where: { id: input.bombId },
      data: {
        ...(newCompanyId ? { companyId: newCompanyId } : {}),
        mark: input.mark,
        model: input.model,
        stages: input.stages,
        potency: input.potency,
        photoId: input.photoId,
      },
    })

    if (photoChanged && oldPhoto) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: oldPhoto.cloudflareR2Key,
          }),
        )

        await prisma.documents.delete({
          where: {
            id: oldPhoto.id,
          },
        })
      } catch {
        // Old photo cleanup failed; bomb was already updated
      }
    }

    return returnsDefaultActionMessage({
      message: 'Bomba atualizada com sucesso',
      success: true,
    })
  })
