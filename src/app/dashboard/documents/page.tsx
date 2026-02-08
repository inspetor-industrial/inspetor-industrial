import { getSession } from '@inspetor/lib/auth/server'
import { redirect } from 'next/navigation'

import { DocumentsFilter } from './components/filter'
import { DocumentsTable } from './components/table'

export default async function DocumentsPage() {
  const session = await getSession()

  if (!session?.user?.email) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Documentos</h1>

      <DocumentsFilter />
      <DocumentsTable />
    </div>
  )
}
