'use server'

import { env } from '@inspetor/env'
import { generateVerificationToken } from '@inspetor/lib/auth/verification-token'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import nodemailer from 'nodemailer'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const sendVerificationEmailAction = authProcedure
  .createServerAction()
  .input(z.object({ email: z.string() }))
  .handler(async ({ input }) => {
    const { email } = input

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return returnsDefaultActionMessage({
        message: 'Usuário não encontrado',
        success: false,
      })
    }

    const verificationToken = generateVerificationToken(user.id)

    const mailOptions = {
      from: env.GOOGLE_EMAIL,
      to: email,
      subject: 'Inspetor Industrial - Verificação de email',
      text: `Clique no link abaixo para verificar seu email: ${env.APPLICATION_URL}/verify-email?token=${verificationToken.token}`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificação de Email - Inspetor Industrial</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #004059; margin: 0; font-size: 28px; font-weight: bold;">Inspetor Industrial</h1>
            </div>
            
            <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px; border: 1px solid rgba(217, 217, 217, 0.3);">
              <h2 style="color: #002b3f; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Verificação de Email</h2>
              <p style="color: #7e7e7f; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
                Olá, <strong style="color: #004059;">${user.name}</strong>! Para completar seu cadastro e garantir a segurança da sua conta, precisamos verificar seu endereço de email.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${env.APPLICATION_URL}/verify-email?token=${verificationToken.token}" 
                   style="display: inline-block; background-color: #004059; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease;">
                  Verificar Email
                </a>
              </div>
              
              <p style="color: #8c8c8c; font-size: 14px; line-height: 1.5; margin: 25px 0 0 0; text-align: center;">
                Se você não conseguir clicar no botão, copie e cole o link abaixo no seu navegador:
              </p>
              <p style="color: #004059; font-size: 14px; word-break: break-all; text-align: center; margin: 10px 0 0 0;">
                ${env.APPLICATION_URL}/verify-email?token=${verificationToken.token}
              </p>
            </div>
            
            <div style="text-align: center; color: #aaa4a4; font-size: 12px; line-height: 1.4;">
              <p style="margin: 0 0 10px 0;">Este link expira em 2 horas por motivos de segurança.</p>
              <p style="margin: 0;">Se você não solicitou esta verificação, pode ignorar este email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: `${env.GOOGLE_EMAIL}`,
    } as nodemailer.SendMailOptions

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: env.GOOGLE_EMAIL,
        pass: env.GOOGLE_PASSWORD,
      },
    })

    const sendMailResponse = await transporter.sendMail(mailOptions)
    if (sendMailResponse.rejected.length > 0) {
      return returnsDefaultActionMessage({
        message: 'Erro ao enviar e-mail de verificação',
        success: false,
      })
    }

    await prisma.verificationToken.create({
      data: verificationToken,
    })

    return returnsDefaultActionMessage({
      message: 'E-mail de verificação enviado com sucesso',
      success: true,
    })
  })
