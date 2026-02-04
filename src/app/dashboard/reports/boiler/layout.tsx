import { getSession } from '@inspetor/lib/auth/server'
import { redirect } from 'next/navigation'

type BoilerReportsLayoutProps = {
  children: React.ReactNode
}

export default async function BoilerReportsLayout({
  children,
}: BoilerReportsLayoutProps) {
  const session = await getSession()
  if (!session) {
    redirect('/auth/sign-in')
  }

  return <>{children}</>
}
