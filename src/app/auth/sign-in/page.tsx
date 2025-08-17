import { auth } from '@inspetor/lib/auth/authjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { SignInForm } from './sign-form'

export default async function SignInPage() {
  const session = await auth()
  if (session?.user) {
    return redirect('/dashboard')
  }

  return (
    <main className="flex h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white max-sm:text-2xl">
            Portal do Inspetor
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Acesse o painel administrativo para gerenciar inspeções e relatórios
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-lg bg-white/10 p-8 shadow-2xl backdrop-blur-sm max-sm:p-6">
          <SignInForm />
          <div className="mt-6 text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-white/80 underline transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Recuperar acesso
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
