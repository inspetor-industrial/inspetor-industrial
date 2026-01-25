'use server'

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@inspetor/env'
import { prisma } from '@inspetor/lib/prisma'
import { r2 } from '@inspetor/lib/r2'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateBombAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      bombId: z.string(),
      mark: z.string(),
      model: z.string(),
      stages: z.string(),
      potency: z.string(),
      photoId: z.string().optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const bomb = await prisma.bomb.findUnique({
      where: {
        id: input.bombId,
        companyId: ctx.user.organization.id,
      },
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

    if (input.photoId) {
      const photo = await prisma.documents.findUnique({
        where: {
          id: input.photoId,
          companyId: ctx.user.organization.id,
        },
      })

      if (!photo) {
        return returnsDefaultActionMessage({
          message: 'Foto não encontrada',
          success: false,
        })
      }
    }

    // Check if photo changed and delete old one
    const photoChanged = input.photoId && input.photoId !== bomb.photoId
    const oldPhoto = bomb.photo

    await prisma.bomb.update({
      where: {
        id: input.bombId,
      },
      data: {
        mark: input.mark,
        model: input.model,
        stages: input.stages,
        potency: input.potency,
        ...(input.photoId && { photoId: input.photoId }),
      },
    })

    // Delete old photo after updating bomb (to avoid foreign key issues)
    if (photoChanged && oldPhoto) {
      try {
        // Delete from R2
        await r2.send(
          new DeleteObjectCommand({
            Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: oldPhoto.cloudflareR2Key,
          }),
        )

        // Delete from database
        await prisma.documents.delete({
          where: {
            id: oldPhoto.id,
          },
        })
      } catch (error) {
        // Log error but don't fail the update
        console.error('[updateBombAction] Failed to delete old photo:', error)
      }
    }

    return returnsDefaultActionMessage({
      message: 'Bomba atualizada com sucesso',
      success: true,
    })
  })
