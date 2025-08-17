import { auth, signOut } from '@inspetor/lib/auth/authjs'
import { redirect } from 'next/navigation'

export async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const session = await auth()
  console.log(session)

  if (!session?.user) {
    await signOut()

    return redirect('/auth/sign-in')
  }

  return <>{children}</>
}
