import { defineAbilityFor } from '@inspetor/casl/ability'
import { getSession } from '@inspetor/lib/auth/server'
import { redirect } from 'next/navigation'

import { ClientFilter } from './components/filter'
import { ClientTable } from './components/table'

export default async function ClientPage() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  const ability = defineAbilityFor(session.user)
  if (!ability.can('read', 'Client')) {
    redirect('/access-denied')
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <ClientFilter />
      <ClientTable />
    </div>
  )
}
