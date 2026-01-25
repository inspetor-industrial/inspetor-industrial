'use server'

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@inspetor/env'
import { prisma } from '@inspetor/lib/prisma'
import { r2 } from '@inspetor/lib/r2'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'
import { getUserByUsernameOrEmail } from './utils/get-user-by-username-or-email'

export const deleteDocumentsAction = authProcedure
  .createServerAction()
  .input(z.object({ documentId: z.string() }))
  .handler(async ({ input, ctx }) => {
    if (!ctx.user.email) {
      return returnsDefaultActionMessage({
        message: 'Usuário não autenticado',
        success: false,
      })
    }

    const user = await getUserByUsernameOrEmail({
      email: ctx.user.email,
      username: ctx.user.username,
    })

    if (!user || !user.companyId) {
      return returnsDefaultActionMessage({
        message: 'Usuário não encontrado',
        success: false,
      })
    }

    const documentOnDatabase = await prisma.documents.findUnique({
      where: {
        id: input.documentId,
        companyId: user.companyId,
      },
    })

    if (!documentOnDatabase) {
      return returnsDefaultActionMessage({
        message:
          'Documento não encontrado ou você não tem permissão para deletá-lo',
        success: false,
      })
    }

    // Check if document is being used by a Bomb
    const bombUsingDocument = await prisma.bomb.findFirst({
      where: {
        photoId: input.documentId,
      },
    })

    if (bombUsingDocument) {
      return returnsDefaultActionMessage({
        message:
          'Este documento está vinculado a uma bomba e não pode ser deletado',
        success: false,
      })
    }

    try {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
          Key: documentOnDatabase.cloudflareR2Key,
        }),
      )
    } catch (r2Error) {
      console.error('[deleteDocumentsAction] R2 delete error:', r2Error)
    }

    try {
      await prisma.documents.delete({
        where: {
          id: input.documentId,
        },
      })
    } catch (dbError) {
      console.error('[deleteDocumentsAction] Database delete error:', dbError)
      return returnsDefaultActionMessage({
        message: 'Erro ao deletar documento do banco de dados',
        success: false,
      })
    }

    return returnsDefaultActionMessage({
      message: 'Documento deletado com sucesso',
      success: true,
    })
  })
