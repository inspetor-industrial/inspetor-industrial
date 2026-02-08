import { UserRole } from '@inspetor/generated/prisma/client'
import { getSession } from '@inspetor/lib/auth/server'
import { redirect } from 'next/navigation'

import { UserFilter } from './components/filter'
import { UserTable } from './components/table'

export default async function UsersPage() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  if (session.user.role !== UserRole.ADMIN) {
    redirect('/access-denied')
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Usuários</h1>

      <UserFilter />
      <UserTable />
    </div>
  )
}
