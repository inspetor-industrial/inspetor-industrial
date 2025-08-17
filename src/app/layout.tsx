import './globals.css'

import { cn } from '@inspetor/lib/utils'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'

import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    template: '%s | Inspetor Industrial',
    default: 'Inspetor Industrial',
  },
  description:
    'Sistema completo de gerenciamento para inspeções industriais, com controle de agendamentos, gestão de usuários, empresas e relatórios detalhados. Plataforma integrada para otimizar o fluxo de trabalho de inspetores e administradores.',
  verification: {
    google: 'C3XBDCl4_QdQAYSF1Kbr5jv17m-LqMpMjWp6akdYWjE',
  },
}

const geist = Geist({
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn('antialiased h-screen', geist.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
