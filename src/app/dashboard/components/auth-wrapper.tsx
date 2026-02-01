import { getSession } from '@inspetor/lib/auth/server'
import { redirect } from 'next/navigation'

export async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.user) {
    return redirect('/auth/sign-in')
  }

  return <>{children}</>
}
