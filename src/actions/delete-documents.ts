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
        ownerId: user.id,
        companyId: user.companyId,
      },
    })

    if (!documentOnDatabase) {
      return returnsDefaultActionMessage({
        message:
          'Acesso negado, você não tem permissão para deletar este documento',
        success: false,
      })
    }

    await r2.send(
      new DeleteObjectCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: documentOnDatabase.cloudflareR2Key,
      }),
    )

    await prisma.documents.delete({
      where: {
        id: input.documentId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Documento deletado com sucesso',
      success: true,
    })
  })
