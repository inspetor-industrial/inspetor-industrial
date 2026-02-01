import { getUserByUsernameOrEmail } from '@inspetor/actions/utils/get-user-by-username-or-email'
import { Button } from '@inspetor/components/ui/button'
import { getSession } from '@inspetor/lib/auth/server'
import { dayjsApi } from '@inspetor/lib/dayjs'
import { prisma } from '@inspetor/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Confetti } from './components/conffeti'
import { VerifyEmailForm } from './components/verify-email-form'

export const dynamic = 'force-dynamic'

interface VerifyEmailPageProps {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams
  try {
    const session = await getSession()

    if (!session?.user) {
      redirect('/auth/sign-in?callbackUrl=/verify-email')
    }

    const user = await getUserByUsernameOrEmail({
      email: session.user.email as string,
      username: session.user.username as string,
    })

    if (!user) {
      return redirect('/access-denied')
    }

    if (user.emailVerified) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Email Verificado com Sucesso!
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Seu email já foi verificado anteriormente. Você pode continuar
                usando a plataforma normalmente.
              </p>
              <Link href="/dashboard">
                <Button className="w-full">Ir para o Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    if (!token) {
      return redirect('/access-denied')
    }

    const verifyEmailToken = await prisma.verificationToken.findFirst({
      where: {
        token: token,
      },
    })

    if (!verifyEmailToken) {
      return redirect('/access-denied')
    }

    const isVerifyEmailTokenExpired = dayjsApi().isAfter(
      verifyEmailToken.expires,
    )
    if (isVerifyEmailTokenExpired) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Token de Verificação Expirado
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                O link de verificação expirou. Por favor, solicite um novo email
                de verificação para continuar.
              </p>
              <div className="space-y-4">
                <VerifyEmailForm email={session?.user?.email} />
              </div>
            </div>
          </div>
        </div>
      )
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    })

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: user.id,
          token: verifyEmailToken.token,
        },
      },
    })

    return (
      <Confetti>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Email Verificado com Sucesso!
              </h2>
              <p className="text-muted-foreground mb-8">
                Seu endereço de email foi verificado com sucesso. Agora você
                pode acessar todos os recursos da plataforma.
              </p>
              <div className="space-y-4">
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Ir para o Dashboard
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center w-full px-4 py-2 border border-border text-base font-medium rounded-md text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Voltar ao Início
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Confetti>
    )
  } catch (error) {
    console.error(error)
    return redirect('/access-denied')
  }
}
