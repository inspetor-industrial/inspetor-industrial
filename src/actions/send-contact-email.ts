'use server'

import { env } from '@inspetor/env'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import nodemailer from 'nodemailer'
import z from 'zod'
import { createServerAction } from 'zsa'

const SERVICES = {
  'boiler-inspection': 'Inspeção de Caldeiras',
  'integrity-inspection': 'Inspeção de Integridade',
  'pipe-inspection': 'Inspeção de Tubulações',
  'pressure-vessel-inspection': 'Inspeção em vasos de pressão',
  'automotive-elevator-inspection': 'Inspeção de Elevador Automotivo',
  'fuel-tanks-inspection': 'Inspeção em Tanques de Combustível',
  'safety-valve-calibration': 'Calibração de Válvula de Segurança',
  'manometer-calibration': 'Calibração de Manômetro',
}

export const sendContactEmailAction = createServerAction()
  .input(
    z.object({
      description: z.string(),
      email: z.string(),
      name: z.string(),
      phoneNumber: z.string(),
      service: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: env.GOOGLE_EMAIL,
        pass: env.GOOGLE_PASSWORD,
      },
    })

    let serviceType = ''
    if (input.service === 'others' || input.service === '') {
      serviceType = 'Outro tipo de serviço'
    } else {
      serviceType = SERVICES[input.service as keyof typeof SERVICES]
    }

    const mailOptions = {
      from: env.GOOGLE_EMAIL,
      to: env.GOOGLE_EMAIL,
      subject: `Sistema de : ${serviceType}`,
      text: `${input.description}`,
      html: `
          <b>Nome do cliente:</b> ${input.name}, <b>Telefone do Cliente: </b>${input.phoneNumber} <br/>
          <b>Tipo de Serviço:</b> ${serviceType} <br/>
          <b>E-mail:</b> ${input.email} <br/>
          <b>Mensagem:</b>${input.description}`,
      replyTo: `${input.email}`,
    } as nodemailer.SendMailOptions

    const sendMailResponse = await transporter.sendMail(mailOptions)
    if (sendMailResponse.rejected.length > 0) {
      return returnsDefaultActionMessage({
        message: 'Erro ao enviar e-mail',
      })
    }

    try {
      await prisma.contact.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phoneNumber,
          service: input.service,
          description: input.description,
        },
      })
    } finally {
    }

    return returnsDefaultActionMessage({
      message: 'E-mail enviado com sucesso',
      success: true,
    })
  })
