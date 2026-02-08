import { getFullAuthenticatedUser } from '@inspetor/lib/auth/get-full-user'
import { getSession } from '@inspetor/lib/auth/server'
import { redirect } from 'next/navigation'

import { BoilerCreationForm } from './_components/form'

export default async function BoilerCreationPage() {
  const session = await getSession()
  const fullUser = await getFullAuthenticatedUser(session)
  if (!fullUser) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">
          Criar relatório de inspeção de caldeira
        </h1>
        <p className="text-sm text-muted-foreground">
          Aqui você pode criar um novo relatório de inspeção de caldeira.
        </p>
      </div>

      <BoilerCreationForm />
    </div>
  )
}
