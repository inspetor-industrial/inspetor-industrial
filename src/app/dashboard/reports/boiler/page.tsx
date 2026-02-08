import { getSession } from '@inspetor/lib/auth/server'
import { redirect } from 'next/navigation'

import { BoilerFilter } from './components/filter'
import { BoilerList } from './boiler-list'

export default async function BoilerPage() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Inspeções de Caldeiras</h1>

      <BoilerFilter />
      <BoilerList />
    </div>
  )
}
