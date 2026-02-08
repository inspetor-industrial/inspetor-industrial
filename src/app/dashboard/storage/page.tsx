import { getSession } from '@inspetor/lib/auth/server'
import { redirect } from 'next/navigation'

import { StorageFilter } from './components/filter'
import { StorageTable } from './components/table'

export default async function StoragePage() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Pastas do Google Drive</h1>

      <StorageFilter />
      <StorageTable />
    </div>
  )
}
