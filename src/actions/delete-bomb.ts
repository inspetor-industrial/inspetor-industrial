'use server'

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { env } from '@inspetor/env'
import { prisma } from '@inspetor/lib/prisma'
import { r2 } from '@inspetor/lib/r2'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteBombAction = authProcedure
  .createServerAction()
  .input(z.object({ bombId: z.string() }))
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
    }) as unknown as Subjects
    if (!ability.can('delete', subjectBomb)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para excluir bomba',
        success: false,
      })
    }

    if (bomb.powerSupplyId) {
      return returnsDefaultActionMessage({
        message:
          'Não é possível excluir esta bomba pois ela está vinculada a um relatório de caldeira (alimentação de energia). Remova o vínculo no relatório antes de excluir.',
        success: false,
        conflict: true,
      })
    }

    const photo = bomb.photo as { id: string; cloudflareR2Key: string } | null

    await prisma.bomb.delete({
      where: { id: input.bombId },
    })

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
      } catch {
        // Photo cleanup failed; bomb was already deleted
      }
    }

    return returnsDefaultActionMessage({
      message: 'Bomba deletada com sucesso',
      success: true,
    })
  })
