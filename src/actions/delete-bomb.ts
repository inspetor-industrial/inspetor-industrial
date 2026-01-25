'use server'

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@inspetor/env'
import { prisma } from '@inspetor/lib/prisma'
import { r2 } from '@inspetor/lib/r2'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteBombAction = authProcedure
  .createServerAction()
  .input(z.object({ bombId: z.string() }))
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

    const photo = bomb.photo

    // Delete bomb first (to release foreign key)
    await prisma.bomb.delete({
      where: {
        id: input.bombId,
        companyId: ctx.user.organization.id,
      },
    })

    // Delete photo from R2 and database
    if (photo) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: photo.cloudflareR2Key,
          }),
        )

        await prisma.documents.delete({
          where: {
            id: photo.id,
          },
        })
      } catch (error) {
        console.error('[deleteBombAction] Failed to delete photo:', error)
      }
    }

    return returnsDefaultActionMessage({
      message: 'Bomba deletada com sucesso',
      success: true,
    })
  })
